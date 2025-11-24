export const IS_PUBLIC_KEY = 'isPublic';

export const SKIP_EXPIRED_TOKEN_CHECK = 'skipExpiredTokenCheck';

export const VALIDATION_LIMITS = {
	COUNTRY: 56,
	NAME: 32,
	PASSWORD: {
		MAX: 64,
		MIN: 6,
	},
} as const;
