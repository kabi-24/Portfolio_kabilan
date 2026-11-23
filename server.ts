import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  message: string;
  receivedAt: string;
}

const recentSubmissions: ContactSubmission[] = [];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/contact', (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid request payload.' });
      return;
    }

    const name = sanitizeText(body.name, 100);
    const email = sanitizeText(body.email, 160);
    const organization = sanitizeText(body.organization, 120);
    const inquiryType = sanitizeText(body.inquiryType, 80) || 'General Inquiry';
    const message = sanitizeText(body.message, 1500);

    const fieldErrors: Record<string, string> = {};

    if (name.length < 2) {
      fieldErrors.name = 'Please enter your name (at least 2 characters).';
    }
    if (!isValidEmail(email)) {
      fieldErrors.email = 'Please enter a valid email address.';
    }
    if (message.length < 15) {
      fieldErrors.message = 'Please include a brief message (at least 15 characters).';
    }

    if (Object.keys(fieldErrors).length > 0) {
      res.status(422).json({
        error: 'Please check the highlighted fields.',
        fieldErrors,
      });
      return;
    }

    const id = `MSG-${Date.now().toString(36).toUpperCase()}`;
    const receivedAt = new Date().toISOString();

    const record: ContactSubmission = {
      id,
      name,
      email,
      organization,
      inquiryType,
      message,
      receivedAt,
    };

    recentSubmissions.unshift(record);
    if (recentSubmissions.length > 100) {
      recentSubmissions.length = 100;
    }

    res.status(201).json({
      ok: true,
      id,
      receivedAt,
      recipient: 'kabilanaranganathan24@gmail.com',
      summary: {
        name,
        email,
        organization,
        inquiryType,
      },
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
