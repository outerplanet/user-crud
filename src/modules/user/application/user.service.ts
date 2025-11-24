import { checkForUniqueQueryError } from '@common/utils';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CreateUserData } from '../domain/data/create-user.data';
import { UpdateUserData } from '../domain/data/update-user.data';
import { UserFilter } from '../domain/filter/user.filter';
import { UserModel } from '../domain/model/user.model';
import { IUserRepository, USER_REPOSITORY } from '../domain/repository/user.repository.interface';

@Injectable()
export class UserService {
	constructor(@Inject(USER_REPOSITORY) private userRepository: IUserRepository) {}

	async createUser({ password, ...dto }: CreateUserData): Promise<UserModel> {
		try {
			password = await this.hashPassword(password);
			return await this.userRepository.create({ ...dto, password });
		} catch (error: any) {
			if (checkForUniqueQueryError(error)) {
				const target = error.meta?.target;
				if (target?.includes('email')) {
					throw new ConflictException('This email address is already used');
				}

				throw new ConflictException('A user with this information already exists');
			}

			throw error;
		}
	}

	async deleteUser(id: string, initiator: UserModel): Promise<UserModel> {
		const user = await this.userRepository.findOneById(id);

		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		if (user.id !== initiator.id) {
			throw new ForbiddenException('You can only delete your own account');
		}

		return this.userRepository.softDelete(user.id);
	}

	findUserByEmail(email: string): Promise<UserModel | null> {
		return this.userRepository.findOneByEmail(email);
	}

	findUserById(id: string): Promise<UserModel | null> {
		return this.userRepository.findOneById(id);
	}

	async findUserByIdOrFail(id: string): Promise<UserModel> {
		const user = await this.userRepository.findOneById(id);

		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		return user;
	}

	findUsers(filter: UserFilter): Promise<UserModel[]> {
		return this.userRepository.find(filter);
	}

	async updateUser(id: string, { password, ...input }: UpdateUserData): Promise<UserModel> {
		const user = await this.userRepository.findOneById(id);

		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		if (password) {
			password = await this.hashPassword(password);
		}

		try {
			return await this.userRepository.updateOne(user.id, {
				...input,
				...(password && { password }),
			});
		} catch (error: any) {
			if (checkForUniqueQueryError(error)) {
				const target = error.meta?.target;
				if (target?.includes('email')) {
					throw new ConflictException('This email address is already used');
				}

				throw new ConflictException('A user with this information already exists');
			}

			throw error;
		}
	}

	private hashPassword(password: string): Promise<string> {
		return hash(password, 12);
	}
}
