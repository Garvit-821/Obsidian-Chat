const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { create } = require('domain');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit auth attempts
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Sanitize HTML to prevent XSS
function sanitizeHtml(html) {
  const { JSDOM } = require('jsdom');
  const { window } = new JSDOM('');
  const DOMPurify = require('dompurify')(window);
  return DOMPurify.sanitize(html);
}

// Auth middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Routes
app.post('/api/auth/register', [
  body('username').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 6 }),
  body('captchaResponse').notEmpty(),
  body('captchaAnswer').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { username, password, captchaResponse, captchaAnswer } = req.body;

    // Verify math CAPTCHA
    if (!captchaAnswer || isNaN(captchaAnswer)) {
      return res.status(400).json({ error: 'Invalid CAPTCHA answer' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    });

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ message: 'Registration successful', user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', [
  body('username').notEmpty(),
  body('password').notEmpty(),
  body('captchaResponse').notEmpty(),
  body('captchaAnswer').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { username, password, captchaResponse, captchaAnswer } = req.body;

    // Verify math CAPTCHA
    if (!captchaAnswer || isNaN(captchaAnswer)) {
      return res.status(400).json({ error: 'Invalid CAPTCHA answer' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.session.userId, username: req.session.username } });
});

// Get recent messages
app.get('/api/messages/:room?', async (req, res) => {
  const room = req.params.room || 'general';
  const limit = parseInt(req.query.limit) || 50;

  try {
    const messages = await prisma.message.findMany({
      where: { room },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (data) => {
    const { room, username } = data;
    socket.join(room);
    socket.emit('joined-room', { room });
    
    // Broadcast user joined
    socket.to(room).emit('user-joined', {
      username,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send-message', async (data) => {
    try {
      const { content, room, userId, username } = data;
      
      // Sanitize message content
      const sanitizedContent = sanitizeHtml(content);
      
      if (!sanitizedContent.trim()) {
        return;
      }

      // Save message to database
      const message = await prisma.message.create({
        data: {
          content: sanitizedContent,
          userId,
          room: room || 'general'
        },
        include: {
          user: { select: { username: true } }
        }
      });

      // Broadcast message to room
      io.to(room || 'general').emit('new-message', {
        id: message.id,
        content: message.content,
        username: message.user.username,
        timestamp: message.createdAt
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('ping', (data) => {
    socket.emit('pong', data);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
