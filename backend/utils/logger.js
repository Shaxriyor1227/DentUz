const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    isProduction ? winston.format.json() : winston.format.simple()
  ),
  defaultMeta: { service: 'dentuz-api' },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
              const reqTag = requestId ? ` [${requestId}]` : '';
              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              return `[${timestamp}] ${level}${reqTag}: ${message}${metaStr}`;
            })
          ),
    }),
  ],
});

module.exports = logger;
