# Darkweb Chatroom Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- No database setup required! (Uses SQLite)

## Quick Setup

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Initialize the database (automatic!):**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```
   This creates a SQLite database file at `server/prisma/dev.db` - no additional setup needed!

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 3001) and frontend development server (port 5173).

## Manual Setup

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   Edit `.env` and update the database URL and session secret.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- **Real-time messaging** with Socket.IO
- **Terminal-style UI** with neon green/cyan colors
- **Authentication** with bcrypt password hashing
- **Math-based CAPTCHA** for registration/login
- **Multiple chat rooms** (general, dev-lounge, cyber-lab)
- **Message sanitization** to prevent XSS
- **Rate limiting** on authentication endpoints
- **Session management** with express-session
- **CRT effects** and terminal animations

## Security Features

- Password hashing with bcrypt
- Message sanitization with DOMPurify
- Rate limiting on auth endpoints
- Session-based authentication
- CSRF protection ready
- XSS prevention

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a secure session secret
3. Set up HTTPS
4. Configure proper CORS origins
5. Use a production PostgreSQL database

## Troubleshooting

- Make sure PostgreSQL is running
- Check that the database URL is correct
- Ensure all environment variables are set
- Check that ports 3001 and 5173 are available
