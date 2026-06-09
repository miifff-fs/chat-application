import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const distPath = path.resolve(__dirname, '../dist');
const clients = new Map();

app.use(
  cors({
    origin: clientOrigin === '*' ? true : clientOrigin,
  }),
);
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    app: 'chat-application',
    status: 'ok',
    storage: 'supabase-planned',
    realtime: 'websocket-ready',
  });
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim().slice(0, 400);
}

function getOnlineUsers() {
  return [...clients.values()].map((client) => ({
    id: client.id,
    username: client.username,
  }));
}

function sendJson(socket, message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function broadcast(message) {
  for (const client of clients.values()) {
    sendJson(client.socket, message);
  }
}

function broadcastUsers() {
  broadcast({
    type: 'users:update',
    payload: {
      users: getOnlineUsers(),
    },
  });
}

function createChatMessage(author, text) {
  return {
    id: randomUUID(),
    author,
    text,
    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date()),
  };
}

wss.on('connection', (socket) => {
  const client = {
    id: randomUUID(),
    socket,
    username: 'Guest',
  };

  clients.set(client.id, client);

  sendJson(socket, {
    type: 'connection:ready',
    payload: {
      clientId: client.id,
      users: getOnlineUsers(),
    },
  });

  broadcastUsers();

  socket.on('message', (rawMessage) => {
    let event;

    try {
      event = JSON.parse(rawMessage.toString());
    } catch {
      sendJson(socket, {
        type: 'error',
        payload: {
          message: 'Invalid message format',
        },
      });
      return;
    }

    if (event.type === 'user:join' || event.type === 'user:update') {
      client.username = sanitizeText(event.payload?.username, 'Guest') || 'Guest';
      broadcastUsers();
      return;
    }

    if (event.type === 'message:send') {
      const text = sanitizeText(event.payload?.text);

      if (!text) {
        return;
      }

      broadcast({
        type: 'message:new',
        payload: {
          message: createChatMessage(client.username, text),
        },
      });
    }
  });

  socket.on('close', () => {
    clients.delete(client.id);
    broadcastUsers();
  });
});

server.listen(port, () => {
  console.log(`Chat server is running on http://localhost:${port}`);
});
