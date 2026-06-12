# Chat Application

[![Maintainability](https://qlty.sh/gh/miifff-fs/projects/chat-application/maintainability.svg)](https://qlty.sh/gh/miifff-fs/projects/chat-application)

Realtime chat application built for production practice. The project is based on the selected catalogue idea: React + Redux-Saga + WebSockets.

Selected project: https://www.freecodecamp.org/news/how-to-build-a-chat-application-using-react-redux-redux-saga-and-web-sockets-47423e4bc21a/

## Features

- Realtime messages with WebSocket
- Online users list
- Editable screen name
- Recent message history
- Supabase PostgreSQL storage with in-memory fallback
- Retro messenger-style UI

## Stack

- Frontend: React, Vite, Redux Toolkit, Redux-Saga
- Backend: Node.js, Express, ws
- Database: Supabase PostgreSQL
- Deployment: Render Web Service
- Code quality: Qlty

## Local Setup

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173

Backend health check: http://localhost:3001/api/health

## Environment

Copy `.env.example` to `.env` and fill Supabase values when database storage is needed.

```bash
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

If Supabase variables are empty, the app uses temporary in-memory message history.

## Database

Run the SQL from `docs/database.sql` in Supabase SQL Editor.

Main table:

- `messages`: stores chat message id, author, text content and creation time.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Deployment

The project includes `render.yaml` for Render. Create a Render Blueprint or Web Service from this repository, then add Supabase environment variables in the Render dashboard.

After deployment, update this section with the live URL:

```text
https://<render-service-name>.onrender.com
```
