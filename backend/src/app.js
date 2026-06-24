const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { supabaseAdmin } = require('./config/supabase');
const errorMiddleware = require('./shared/middleware/error.middleware');
const env = require('./config/env');
const logger = require('./shared/utils/logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } }
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth', apiLimiter);
app.use('/api', apiLimiter);

app.use(morgan('short', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

app.use((req, _res, next) => {
  req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
});

app.get('/health', async (_req, res) => {
  let dbStatus = 'ok';
  try {
    const { error } = await supabaseAdmin.from('user_profiles').select('id').limit(1);
    if (error) dbStatus = 'degraded';
  } catch {
    dbStatus = 'unreachable';
  }

  res.json({
    success: true,
    data: {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime()
    }
  });
});

app.use('/auth', require('./auth/auth.routes'));
app.use('/onboarding', require('./onboarding/onboarding.routes'));
app.use('/events', require('./organizer-events/organizer-events.routes'));
app.use('/', require('./vendor-procurement/vendor-procurement.routes'));
app.use('/procurement-requests', require('./contract-booking/contract-booking.routes'));
app.use('/vendor', require('./vendor-b2b-dashboard/vendor-b2b-dashboard.routes'));
app.use('/admin', require('./admin-operations/admin-operations.routes'));
app.use('/contracts', require('./contract-booking/contract.routes'));
app.use('/notifications', require('./notifications/notifications.routes'));
app.use('/organizer/dashboard', require('./organizer-dashboard/organizer-dashboard.routes'));
app.use('/api/organizer/dashboard', require('./organizer-dashboard/organizer-dashboard.routes'));
app.use('/', require('./profiles/profiles.routes'));
app.use('/', require('./phase8/phase8.routes'));

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
    meta: {}
  });
});

app.use(errorMiddleware);

module.exports = app;
