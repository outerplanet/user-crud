export interface CreateUserSessionData {
	expiresAt: Date;
	hashedRefreshToken: string;
	userId: string;
}
