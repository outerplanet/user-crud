import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfigService } from './shared/config/app-config.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(AppConfigService);
	const port = process.env.PORT || 5000;

	// Parse allowed origins from environment variable
	const allowedOrigins = configService.corsAllowedOrigins
		.split(',')
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);

	app.enableCors({
		credentials: true,
		origin: allowedOrigins.length > 0 ? allowedOrigins : false,
	});

	app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false, transform: true }));

	app.use(cookieParser());

	// Swagger configuration
	const config = new DocumentBuilder()
		.setTitle('API')
		.setDescription('API documentation')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(port);

	Logger.log(`🚀 API is running on: http://localhost:${port}/`);
	Logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();
