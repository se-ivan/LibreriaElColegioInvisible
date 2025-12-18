import winston from 'winston';

const logger = winston.createLogger({
  level: import.meta.env?.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.json()
  ),
  defaultMeta: { service: import.meta.env?.PUBLIC_SERVICE_NAME || 'astro-app' }, 
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }), 
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `[${timestamp}] [${service}] ${level}: ${message} ${metaString}`;
        })
      ),
    }),
  ],
});

export default logger;  