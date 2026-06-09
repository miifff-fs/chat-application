import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const distPath = path.resolve(__dirname, '../dist');

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
    realtime: 'websocket-planned',
  });
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Chat server is running on http://localhost:${port}`);
});
