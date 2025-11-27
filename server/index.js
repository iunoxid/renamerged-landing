import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

const db = new Database(join(__dirname, 'downloads.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS download_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const row = db.prepare('SELECT COUNT(*) as count FROM download_stats').get();
if (row.count === 0) {
  db.prepare('INSERT INTO download_stats (count) VALUES (0)').run();
}

app.post('/api/track-download', (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE download_stats
      SET count = count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);
    stmt.run();

    const result = db.prepare('SELECT count FROM download_stats WHERE id = 1').get();

    res.json({
      success: true,
      count: result.count
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track download'
    });
  }
});

app.get('/api/download-count', (req, res) => {
  try {
    const result = db.prepare('SELECT count FROM download_stats WHERE id = 1').get();

    res.json({
      success: true,
      count: result.count
    });
  } catch (error) {
    console.error('Error fetching download count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch download count'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
