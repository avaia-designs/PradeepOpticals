import morgan from 'morgan';
import { Request, Response } from 'express';
import { Logger } from '../utils/logger';

/**
 * Request logging middleware using Morgan
 * Logs all HTTP requests with correlation IDs and response times
 */
export const requestLogger = (): any => {
  // Custom token for correlation ID
  morgan.token('correlation-id', (req: Request) => {
    const correlationId = req.headers['x-correlation-id'];
    return Array.isArray(correlationId) ? correlationId[0] : correlationId || Logger.generateCorrelationId();
  });

  // Custom token for response time in milliseconds
  morgan.token('response-time-ms', (req: Request, res: Response) => {
    const responseTime = res.get('X-Response-Time');
    return responseTime ? `${responseTime}ms` : '0ms';
  });

  // Custom format for structured logging
  const format = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :correlation-id :response-time-ms';

  return morgan(format, {
    stream: {
      write: (message: string) => {
        // Parse Morgan log message and convert to structured format
        const logData = parseMorganLog(message);
        Logger.info('HTTP Request', logData, logData.correlationId);
      }
    }
  });
};

/**
 * Parse Morgan log message into structured data
 */
function parseMorganLog(message: string): Record<string, any> {
  const parts = message.trim().split(' ');
  
  return {
    remoteAddr: parts[0],
    remoteUser: parts[2] === '-' ? undefined : parts[2],
    timestamp: parts[3] + ' ' + parts[4],
    method: parts[5]?.replace('"', ''),
    url: parts[6],
    httpVersion: parts[7]?.replace('HTTP/', ''),
    statusCode: parseInt(parts[8]),
    contentLength: parts[9] === '-' ? 0 : parseInt(parts[9]),
    referrer: parts[10]?.replace(/"/g, ''),
    userAgent: parts[11]?.replace(/"/g, ''),
    correlationId: parts[12],
    responseTime: parts[13]
  };
}
