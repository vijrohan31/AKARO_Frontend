#!/bin/bash
set -e  # Exit immediately on error

PORT=5011
PROJECT_DIR="/root/AKARO_Frontend"
APP_NAME="Akaro-Frontend"

echo "🚀 Starting deployment process for $APP_NAME..." 

# Ensure we are in the project directory
cd "$PROJECT_DIR" || { echo "❌ Failed to enter project directory"; exit 1; }

echo "🔍 Checking for existing process on port $PORT..."
PID=$(lsof -ti :$PORT || true)

if [ -n "$PID" ]; then
  echo "🧨 Killing process using port $PORT (PID: $PID)"
  kill -9 "$PID" || echo "⚠️ Failed to kill process $PID"
else
  echo "✅ No process found on port $PORT"
fi

echo "📡 Pulling latest changes..."
git pull

echo "📦 Installing dependencies..."
npm install --silent

echo "🔨 Building the app..."
npm run build

echo "🚀 Starting the app on port $PORT with PM2..."

# Install PM2 if missing (NO sudo)
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2..."
  npm install -g pm2
fi

# Stop and delete existing PM2 app if it exists
if pm2 list | grep -q "$APP_NAME"; then
  echo "🔁 Stopping existing PM2 process..."
  pm2 stop "$APP_NAME"
  pm2 delete "$APP_NAME"
fi

# Start app
pm2 start npm --name "$APP_NAME" -- start -- -p $PORT
pm2 save

echo "✅ App started successfully via PM2."
pm2 status
