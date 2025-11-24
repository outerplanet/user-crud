import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { UserSessionModel } from '../domain/model/user-session.model';
import {
	IUserSessionRepository,
	USER_SESSION_REPOSITORY,
} from '../domain/repository/user-session.repository.interface';
import { CreateUserSessionCommand } from './command/create-user-session.command';

@Injectable()
export class UserSessionService {
	constructor(@Inject(USER_SESSION_REPOSITORY) private userSessionRepository: IUserSessionRepository) {}

	async createSession(dto: CreateUserSessionCommand): Promise<UserSessionModel> {
		const hashedRefreshToken = await hash(dto.refreshToken, 10);

		return this.userSessionRepository.create({
			expiresAt: dto.expiresAt,
			hashedRefreshToken,
			userId: dto.userId,
		});
	}

	deleteExpiredSessions(): Promise<number> {
		return this.userSessionRepository.deleteExpiredSessions();
	}

	async deleteSession(id: string): Promise<UserSessionModel> {
		const session = await this.userSessionRepository.findOneById(id);

		if (!session) {
			throw new NotFoundException(`User session with id ${id} not found`);
		}

		await this.userSessionRepository.delete(id);

		return session;
	}

	async findSessionByToken(userId: string, refreshToken: string): Promise<UserSessionModel> {
		const sessions = await this.userSessionRepository.findByUserId(userId);

		// Compare all tokens in parallel for better performance
		const comparisons = await Promise.all(
			sessions.map(async (session) => ({
				isValid: await compare(refreshToken, session.hashedRefreshToken),
				session,
			})),
		);

		const matchedSession = comparisons.find((comparison) => comparison.isValid)?.session;

		if (!matchedSession) {
			throw new UnauthorizedException('Invalid refresh token');
		}

		if (matchedSession.expiresAt < new Date()) {
			throw new UnauthorizedException('Refresh token has expired');
		}

		return matchedSession;
	}
}
