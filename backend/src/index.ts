import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import notesRouter from './routes/notes.js';
import analyzeRouter from './routes/analyze.js';
import statsRouter from './routes/stats.js';
import { dbInfo } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'ITSS2 API đang chạy',
    database: dbInfo.dbPath,
  });
});

app.use('/api/notes', notesRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/stats', statsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Backend: http://localhost:${PORT}`);
});
