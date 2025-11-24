import { IS_PUBLIC_KEY, SKIP_EXPIRED_TOKEN_CHECK } from '@common/constants';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private reflector: Reflector) {
		super();
	}

	override handleRequest(err: Error | null, user: any, info: Error | undefined, context: ExecutionContext) {
		if (err) {
			throw err;
		}

		const skipExpiredTokenCheck = this.reflector.getAllAndOverride<boolean>(SKIP_EXPIRED_TOKEN_CHECK, [
			context.getHandler(),
			context.getClass(),
		]);

		if (info?.name === 'TokenExpiredError' && !skipExpiredTokenCheck) {
			throw new UnauthorizedException('Token expired');
		}

		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (user || isPublic) {
			return user;
		}

		throw new UnauthorizedException();
	}
}
