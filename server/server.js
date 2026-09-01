require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Behind Vercel/Render/etc. there is exactly one proxy in front of the app.
// Trust it so express-rate-limit and req.ip see the real client IP.
app.set('trust proxy', 1);

// --- Security & parsing middleware ---
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // strips $/. operators from req.body/query/params

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Any Vercel deployment/preview URL for this app is fine.
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global API rate limit (auth routes get a tighter one below)
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
);
app.use(
  '/api/auth',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false })
);

// Serve uploaded PDFs (local/non-serverless deployments only - see README)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

// Ensure the DB is connected before any real API route runs. On serverless the
// connection is cached, so this is a no-op after the first request.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

// Only listen when run directly (node server.js). When imported by the
// Vercel serverless handler (api/index.js) we just export `app`.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = app;
