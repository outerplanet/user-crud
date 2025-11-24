import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/presentation/passport/jwt-auth.guard';
import { UserModule } from './modules/user/user.module';
import { AppConfigModule } from './shared/config/app-config.module';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
	controllers: [AppController],
	imports: [PrismaModule, ScheduleModule.forRoot(), AppConfigModule, AuthModule, UserModule],
	providers: [
		{ provide: APP_FILTER, useClass: HttpExceptionFilter },
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestLoggingMiddleware).forRoutes('*');
	}
}
