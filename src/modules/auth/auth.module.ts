import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigModule } from '@shared/config/app-config.module';
import { AppConfigService } from '@shared/config/app-config.service';
import { UserModule } from '../user/user.module';
import { AuthService } from './application/auth.service';
import { UserSessionCleanupService } from './application/user-session-cleanup.service';
import { UserSessionService } from './application/user-session.service';
import { USER_SESSION_REPOSITORY } from './domain/repository/user-session.repository.interface';
import { UserSessionRepository } from './infrastructure/user-session.repository';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './presentation/passport/jwt.strategy';
import { LocalStrategy } from './presentation/passport/local.strategy';

@Module({
	controllers: [AuthController],
	exports: [AuthService],
	imports: [
		JwtModule.registerAsync({
			imports: [AppConfigModule],
			inject: [AppConfigService],
			useFactory: (configService: AppConfigService) => ({
				secret: configService.jwtSecret,
				signOptions: {
					expiresIn: configService.jwtExpTime as `${number}${'d' | 'h' | 'm' | 's' | 'y'}`,
				},
			}),
		}),
		PassportModule,
		AppConfigModule,
		UserModule,
	],
	providers: [
		{ provide: USER_SESSION_REPOSITORY, useClass: UserSessionRepository },
		AuthService,
		JwtStrategy,
		LocalStrategy,
		UserSessionCleanupService,
		UserSessionService,
	],
})
export class AuthModule {}
