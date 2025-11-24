export interface CreateUserSessionCommand {
	expiresAt: Date;
	refreshToken: string;
	userId: string;
}
