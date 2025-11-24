import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AppConfigService } from './app-config.service';

@Module({
	exports: [AppConfigService],
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
			validationSchema: Joi.object({
				CORS_ALLOWED_ORIGINS: Joi.string().required(),

				JWT_EXP_TIME: Joi.string().required(),
				JWT_SECRET: Joi.string().required(),

				NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

				POSTGRES_DB_URL: Joi.string().required(),
			}),
		}),
	],
	providers: [AppConfigService],
})
export class AppConfigModule {}
