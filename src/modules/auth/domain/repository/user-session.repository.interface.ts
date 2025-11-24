import { CreateUserSessionData } from '../data/create-user-session.data';
import { UserSessionModel } from '../model/user-session.model';

export const USER_SESSION_REPOSITORY = Symbol('IUserSessionRepository');

export interface IUserSessionRepository {
	create(data: CreateUserSessionData): Promise<UserSessionModel>;

	delete(id: string): Promise<void>;

	deleteExpiredSessions(): Promise<number>;

	findByUserId(userId: string): Promise<UserSessionModel[]>;

	findOneById(id: string): Promise<UserSessionModel | null>;
}
