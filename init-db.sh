#!/bin/bash

echo "Initializing Darkweb Chatroom Database..."
echo ""
echo "Make sure PostgreSQL is running!"
echo ""
cd server
echo "Generating Prisma client..."
npx prisma generate
echo ""
echo "Pushing database schema..."
npx prisma db push
echo ""
echo "Database initialization complete!"
echo "You can now start the application with: npm run dev"
