import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
	private readonly logger = new Logger('HTTP');

	use(req: Request, res: Response, next: NextFunction) {
		const { method, originalUrl } = req;
		const startTime = Date.now();

		this.logger.log(`→ ${method} ${originalUrl} - Request started`);

		// Capture when the response finishes
		res.on('finish', () => {
			const endTime = Date.now();
			const duration = endTime - startTime;
			const { statusCode } = res;

			const logMessage = `← ${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`;

			if (statusCode >= 500) {
				this.logger.error(logMessage);
			} else if (statusCode >= 400) {
				this.logger.warn(logMessage);
			} else {
				this.logger.log(logMessage);
			}
		});

		next();
	}
}
