import { CreateUserData } from '../data/create-user.data';
import { UpdateUserData } from '../data/update-user.data';
import { UserFilter } from '../filter/user.filter';
import { UserModel } from '../model/user.model';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
	create(data: CreateUserData): Promise<UserModel>;

	find(filter: UserFilter): Promise<UserModel[]>;

	findOneByEmail(email: string): Promise<UserModel | null>;

	findOneById(id: string): Promise<UserModel | null>;

	softDelete(id: string): Promise<UserModel>;

	updateOne(id: string, data: UpdateUserData): Promise<UserModel>;
}
