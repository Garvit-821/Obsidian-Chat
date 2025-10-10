Build a full-stack real-time chatroom web app with the following specifications:

🧠 Concept & Aesthetic

The theme is “darkweb / blackhat / hacker terminal” — purely aesthetic, not related to any real dark web activity.

Use a black background (#000), neon green (#00ff6a) and cyan (#00eaff) accents.

Typography: monospace (JetBrains Mono, Fira Code, or IBM Plex Mono).

Add subtle CRT flicker, glow, and typing cursor animations.

Interface should look like a terminal dashboard, not a modern chat bubble app.

💻 Stack

Frontend: React + Vite + Tailwind CSS.

Backend: Node.js + Express + Socket.IO.

Database: PostgreSQL (via Prisma or Sequelize).

Auth: bcrypt password hashing + express-session (cookie-based login).

CAPTCHA: Google reCAPTCHA v2 on signup/login.

Security: sanitize messages, HTTPS-ready setup, session protection, CSRF protection.

🧱 Core Features

Signup / Login page with:

username + password fields

CAPTCHA verification

password hashed using bcrypt before saving

dark terminal-style layout:

[ ACCESS TERMINAL ]

> username: _____

> password: *****

> [ VERIFY CAPTCHA ]

Chatroom (global at first):

real-time messages using Socket.IO

user joins, message broadcasted to all clients

timestamp + username for each message

messages saved to DB

Session persistence — logged-in users stay authenticated using cookies.

Message sanitization to prevent XSS.

Rate limiting on login & message endpoints.

Rooms (optional extension): /general, /dev-lounge, /cyber-lab.

🎨 Theming & Effects

Use neon glows (text-shadow / box-shadow) and light scanline overlay.

Add fake “system log” panel showing join/leave events:

[14:23:01] user@core joined channel

[14:23:15] root@core:> Hello, world

Include small animation of blinking >_ cursor on input fields.

Optional retro sound effects when message sent/received.

🚀 Deliverables

Fully runnable project with both frontend and backend.

Include setup instructions (npm install, .env example, npm run dev).

Use minimal dependencies — focus on clarity and clean code.

Make sure the visual style screams darkweb aesthetic: hacker-style terminal, glowing text, and minimal modern UI.


I understand your vision for the darkweb terminal chatroom using the Node.js stack. Given the current environment and platform limitations, I can develop this application using the supported FastAPI + React + MongoDB stack.

FastAPI with WebSockets is capable of providing real-time messaging functionality similar to Socket.IO. I will ensure the chatroom embodies the darkweb/hacker terminal aesthetic you desire, including neon green/cyan colors, CRT effects, and terminal styling.

Here's what I can deliver:

Real-time messaging with FastAPI WebSockets
Session-based authentication using cookies
Math-based CAPTCHA for verification
MongoDB for message storage
Full terminal styling and effects specified earlier
This approach allows us to build a functional and visually aligned chatroom within current technical constraints. Please let me know if you'd like me to proceed with this setup.