import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import mongoSanitize from 'express-mongo-sanitize';
import { connectToDB } from './config/database.js';
import env from './config/env.js';
import routes from './routes/index.js';
import errorMiddleware from './middleware/error.middleware.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { initializeJobs } from './jobs/index.js';
import { initSocket } from './socket/socket.server.js';

// ── Environment ──────────────────────────────────────────────────────────────


const PORT = env.port || 5000;
const NODE_ENV = env.nodeEnv;

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1); // Enable trusting the reverse proxy for express-rate-limit

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.clientOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

// ── Rate Limiting (global) ───────────────────────────────────────────────────
app.use('/api', globalLimiter);

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' })); // Increased limit to allow base64 image uploads and documents
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── NoSQL Injection Sanitisation ─────────────────────────────────────────────
app.use(mongoSanitize());

// ── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ── HTTP Logging (skip in test env to keep test output clean) ────────────────
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── API Routes (versioned) ───────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 — catch unmatched routes before error handler ───────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (must be LAST) ──────────────────────────────────────
app.use(errorMiddleware);

// ── Start Server (not in test env — supertest handles its own binding) ───────
if (NODE_ENV !== 'test') {
  (async () => {
    try {
      await connectToDB();

      // Initialize Background Jobs
      initializeJobs();

      const server = app.listen(PORT, () => {
        console.log(`✅  Server running on: http://localhost:${PORT}`);
        console.log(
          `🏥  Health check:      http://localhost:${PORT}/api/v1/health`,
        );
        console.log(`🌍  Environment:       ${NODE_ENV}`);
      });

      // Initialize Socket.io
      initSocket(server);

      server.on("error", (error) => {
        console.error("❌ Server Error: ", error);
        process.exit(1);
      });

    } catch (error) {
      console.error("❌ Error during startup: ", error);
      process.exit(1);
    }
  })();
}

export default app;
