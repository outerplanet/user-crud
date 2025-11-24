import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
	error: string;
	message: string[] | string;
	path: string;
	statusCode: number;
	timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger('ExceptionFilter');

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message: string[] | string = 'Internal server error';
		let error = 'Internal Server Error';

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === 'string') {
				message = exceptionResponse;
				error = exception.name;
			} else if (typeof exceptionResponse === 'object') {
				const responseObj = exceptionResponse as Record<string, unknown>;
				message = (responseObj.message as string[] | string) || exception.message;
				error = (responseObj.error as string) || exception.name;
			}
		} else if (exception instanceof Error) {
			message = exception.message;
			error = exception.name;
		}

		const errorResponse: ErrorResponse = {
			error,
			message,
			path: request.url,
			statusCode: status,
			timestamp: new Date().toISOString(),
		};

		// Log the error
		if (status >= 500) {
			this.logger.error(
				`${request.method} ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`,
				exception instanceof Error ? exception.stack : undefined,
			);
		} else {
			this.logger.warn(`${request.method} ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`);
		}

		response.status(status).json(errorResponse);
	}
}
