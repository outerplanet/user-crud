import { IS_PUBLIC_KEY, SKIP_EXPIRED_TOKEN_CHECK } from '@common/constants';
import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	return request.user ?? null;
});

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const SkipExpiredTokenCheck = () => SetMetadata(SKIP_EXPIRED_TOKEN_CHECK, true);
