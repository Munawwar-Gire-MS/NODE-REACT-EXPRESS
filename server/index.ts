import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.js';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from './utils/db.js';
import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { config } from 'dotenv';
import { setRequestContext } from './utils/request-context.js';
import { agentDashboardRouter } from './routes/agentDashboard.js';
import todosRouter from './routes/todos.routes.js';
import { adminRouter } from './routes/admin.js';
import invitesRouter from './routes/invites.js';
import rosterRouter from './routes/roster.js';
import { clientRouter } from './routes/client.js';
import { calendarRouter } from './routes/calendar.js';
import { agentRouter } from './routes/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientPath = path.resolve(__dirname, '../../dist/client');

// Load environment variables first
config();

// Initialize Azure Monitor before any other operations
if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  console.warn('No Application Insights connection string found. Telemetry will not be sent.');
} else {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    },
  });
  console.log('Azure Monitor initialized');
}

// Initialize database connection
await connectToDatabase();

async function createServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Add middleware to set request context
  app.use((req, _res, next) => {
    setRequestContext(req);
    next();
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/agent-dashboard', agentDashboardRouter);
  app.use('/api/todos', todosRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/invites', invitesRouter);
  app.use('/api/roster', rosterRouter);
  app.use('/api/client', clientRouter);
  app.use('/api/calendar', calendarRouter);
  app.use('/api/agent', agentRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // In development, use Vite's dev server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built files
    app.use(express.static(clientPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 8081;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

createServer();
