const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorMiddleware = require('./shared/middleware/error.middleware');
const env = require('./config/env');
const logger = require('./shared/utils/logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use(morgan('short', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

app.use((req, _res, next) => {
  req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
});

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

app.use('/auth', require('./auth/auth.routes'));
app.use('/events', require('./organizer-events/organizer-events.routes'));
app.use('/', require('./vendor-procurement/vendor-procurement.routes'));
app.use('/procurement-requests', require('./contract-booking/contract-booking.routes'));
app.use('/vendor', require('./vendor-b2b-dashboard/vendor-b2b-dashboard.routes'));
app.use('/admin', require('./admin-operations/admin-operations.routes'));

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
    meta: {}
  });
});

app.use(errorMiddleware);

module.exports = app;
