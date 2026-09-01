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
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
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
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

// Only listen when run directly (node server.js). When imported by the
// Vercel serverless handler (api/index.js) we just export `app`.
if (require.main === module) {
  connectDB().then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`API listening on port ${port}`));
  });
} else {
  connectDB();
}

module.exports = app;
