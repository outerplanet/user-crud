export interface UserSessionModel {
	createdAt: Date;
	expiresAt: Date;
	hashedRefreshToken: string;
	id: string;
	userId: string;
}
