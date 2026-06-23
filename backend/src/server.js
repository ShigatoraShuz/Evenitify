const app = require('./app');
const env = require('./config/env');
const logger = require('./shared/utils/logger');

app.listen(env.port, () => {
  logger.info(`Eventify API server running on port ${env.port}`, {
    environment: env.nodeEnv
  });
});
