import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const query = (text: string, params?: any[]) => pool.query(text, params);

// Initialize Database
const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Skipping DB initialization.');
    return;
  }
  
  try {
    const client = await pool.connect();
    try {
      // Check if company table exists as a proxy for DB existence
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'company'
        );
      `);

      if (!res.rows[0].exists) {
        console.log('Initializing database from base.sql...');
        const sqlPath = path.resolve(__dirname, 'base.sql');
        if (fs.existsSync(sqlPath)) {
          const sql = fs.readFileSync(sqlPath, 'utf8');
          await client.query(sql);
          console.log('Database initialized successfully.');
        } else {
          console.error('base.sql not found at', sqlPath);
        }
      } else {
        console.log('Database already initialized.');
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// API Routes
app.get('/api/companies', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM company ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.post('/api/companies', async (req: Request, res: Response) => {
  const { name, company_type, tax_code } = req.body;
  try {
    const result = await query(
      'INSERT INTO company (name, company_type, tax_code) VALUES ($1, $2, $3) RETURNING *',
      [name, company_type, tax_code]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

app.get('/api/employees', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM employee ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.get('/api/org-units', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM organization_unit ORDER BY level, name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch org units' });
  }
});

app.get('/api/roles', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM role ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

app.get('/api/services', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM service WHERE is_active = true');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
const startServer = async () => {
  await initDb();

  if (process.env.NODE_ENV !== 'production') {
    // Development: Use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, 'frontend'), // Point to frontend folder
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files
    const distPath = path.resolve(__dirname, 'frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
