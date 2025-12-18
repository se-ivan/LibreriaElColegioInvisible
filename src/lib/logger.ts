import winston from "winston"

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "cyan",
  },
}

winston.addColors(customLevels.colors)

const level = () => {
  const env = process.env.NODE_ENV || "development"
  return env === "development" ? "debug" : "info"
}

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, correlationId, context, duration, ...meta }) => {
    let log = `[${timestamp}] ${level}: ${message}`

    if (correlationId) log += ` [ID: ${correlationId}]`
    if (duration) log += ` (${duration}ms)`
    if (context && Object.keys(context).length) {
      log += `\n  Context: ${JSON.stringify(context, null, 2)}`
    }

    // Metadata adicional
    const extraMeta = { ...meta }
    delete extraMeta.service
    if (Object.keys(extraMeta).length) {
      log += `\n  Meta: ${JSON.stringify(extraMeta)}`
    }

    return log
  }),
)

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production" ? jsonFormat : consoleFormat,
  }),
]

// En producción podrías agregar más transports:
// - winston.transports.File para logs persistentes
// - Transports para servicios externos (Datadog, LogDNA, etc.)

const logger = winston.createLogger({
  level: level(),
  levels: customLevels.levels,
  defaultMeta: {
    service: "libreria-colegio-invisible",
    environment: process.env.NODE_ENV || "development",
  },
  transports,
})

export function createContextLogger(context: Record<string, unknown>) {
  return logger.child(context)
}

export function logRequest(req: Request, correlationId: string) {
  const url = new URL(req.url)
  logger.http("Incoming request", {
    correlationId,
    context: {
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      userAgent: req.headers.get("user-agent")?.slice(0, 100),
    },
  })
}

export function logResponse(
  statusCode: number,
  correlationId: string,
  duration: number,
  context?: Record<string, unknown>,
) {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "http"
  logger.log(level, "Request completed", {
    correlationId,
    duration,
    context: {
      statusCode,
      ...context,
    },
  })
}

export function logError(error: Error | unknown, message: string, context?: Record<string, unknown>) {
  const errorObj = error instanceof Error ? error : new Error(String(error))
  logger.error(message, {
    context,
    error: {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
    },
  })
}

export function logDbOperation(
  operation: "CREATE" | "READ" | "UPDATE" | "DELETE",
  entity: string,
  duration: number,
  context?: Record<string, unknown>,
) {
  logger.info(`DB ${operation}: ${entity}`, {
    duration,
    context: {
      operation,
      entity,
      ...context,
    },
  })
}

export function generateCorrelationId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export default logger
