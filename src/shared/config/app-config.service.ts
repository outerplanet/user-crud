import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
	get corsAllowedOrigins(): string {
		return this.configService.getOrThrow('CORS_ALLOWED_ORIGINS');
	}

	get jwtExpTime(): string {
		return this.configService.getOrThrow('JWT_EXP_TIME');
	}

	get jwtSecret(): string {
		return this.configService.getOrThrow('JWT_SECRET');
	}

	get nodeEnv(): string {
		return this.configService.getOrThrow('NODE_ENV');
	}

	get postgresDbUrl(): string {
		return this.configService.getOrThrow('POSTGRES_DB_URL');
	}

	constructor(private configService: ConfigService) {}
}
