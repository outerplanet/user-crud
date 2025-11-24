import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateUserSessionData } from '../domain/data/create-user-session.data';
import { UserSessionModel } from '../domain/model/user-session.model';
import { IUserSessionRepository } from '../domain/repository/user-session.repository.interface';

@Injectable()
export class UserSessionRepository implements IUserSessionRepository {
	constructor(private readonly prisma: PrismaService) {}

	create(data: CreateUserSessionData): Promise<UserSessionModel> {
		return this.prisma.userSession.create({ data });
	}

	async delete(id: string): Promise<void> {
		await this.prisma.userSession.delete({ where: { id } });
	}

	async deleteExpiredSessions(): Promise<number> {
		const result = await this.prisma.userSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
		return result.count;
	}

	findByUserId(userId: string): Promise<UserSessionModel[]> {
		return this.prisma.userSession.findMany({ where: { userId } });
	}

	findOneById(id: string): Promise<UserSessionModel | null> {
		return this.prisma.userSession.findUnique({ where: { id } });
	}
}
