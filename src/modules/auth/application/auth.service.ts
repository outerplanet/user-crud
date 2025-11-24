import { UserService } from '@modules/user/application/user.service';
import { CreateUserData } from '@modules/user/domain/data/create-user.data';
import { UserModel } from '@modules/user/domain/model/user.model';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserSessionModel } from '../domain/model/user-session.model';
import { AuthTokens } from './types/auth-tokens';
import { UserSessionService } from './user-session.service';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private userSessionService: UserSessionService,
	) {}

	async logIn(userId: string): Promise<AuthTokens> {
		const accessToken = this.jwtService.sign({ sub: userId });
		const refreshToken = this.jwtService.sign({ sub: userId }, { expiresIn: '30d' });

		const expiresAt = new Date(this.jwtService.decode(refreshToken).exp * 1000);
		await this.userSessionService.createSession({ expiresAt, refreshToken, userId });

		return { accessToken, refreshToken };
	}

	async logOut(refreshToken: string): Promise<void> {
		const userSession = await this.findUserSessionByToken(refreshToken);
		await this.userSessionService.deleteSession(userSession.id);
	}

	async refreshToken(refreshToken: string): Promise<AuthTokens> {
		const userSession = await this.findUserSessionByToken(refreshToken);

		const tokens = await this.logIn(userSession.userId);
		await this.userSessionService.deleteSession(userSession.id);

		return tokens;
	}

	async signUp(command: CreateUserData): Promise<AuthTokens & { user: UserModel }> {
		const user = await this.userService.createUser(command);
		const { accessToken, refreshToken } = await this.logIn(user.id);

		return { accessToken, refreshToken, user };
	}

	async validateUser(email: string, password: string): Promise<UserModel> {
		const user = await this.userService.findUserByEmail(email);

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		if (await compare(password, user.password)) {
			return user;
		}

		throw new UnauthorizedException('Wrong password');
	}

	private findUserSessionByToken(refreshToken: string): Promise<UserSessionModel> {
		const payload = this.jwtService.verify(refreshToken);
		const userId = payload.sub;

		return this.userSessionService.findSessionByToken(userId, refreshToken);
	}
}
