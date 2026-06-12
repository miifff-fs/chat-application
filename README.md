# Chat Application

[![Maintainability](https://qlty.sh/gh/miifff-fs/projects/chat-application/maintainability.svg)](https://qlty.sh/gh/miifff-fs/projects/chat-application)

Realtime chat application based on the selected practice project:
https://www.freecodecamp.org/news/how-to-build-a-chat-application-using-react-redux-redux-saga-and-web-sockets-47423e4bc21a/

## Stack

- React, Vite, Redux Toolkit, Redux-Saga
- Node.js, Express, WebSocket (`ws`)
- Supabase PostgreSQL
- Render

## Features

- realtime chat messages
- online users list
- editable screen name
- recent message history
- retro messenger UI

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

Create `.env` from `.env.example`.

```bash
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Without Supabase values, message history is stored in memory.

## Database

Run `docs/database.sql` in Supabase SQL Editor.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Deployment

Use `render.yaml` to deploy the project as a Render Web Service.
