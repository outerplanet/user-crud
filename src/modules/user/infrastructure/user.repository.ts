import { Injectable } from '@nestjs/common';
import { Prisma, User, UserThemePrisma } from '@prisma/client';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateUserData } from '../domain/data/create-user.data';
import { UpdateUserData } from '../domain/data/update-user.data';
import { UserFilter } from '../domain/filter/user.filter';
import { UserModel } from '../domain/model/user.model';
import { IUserRepository } from '../domain/repository/user.repository.interface';
import { UserTheme } from '../domain/user.enums';

@Injectable()
export class UserRepository implements IUserRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateUserData): Promise<UserModel> {
		const user = await this.prisma.user.create({ data });
		return this.toDomain(user);
	}

	async find(filter: UserFilter): Promise<UserModel[]> {
		const { search, ...restFilter } = filter;
		const where: Prisma.UserWhereInput = restFilter;

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ lastName: { contains: search, mode: 'insensitive' } },
			];
		}

		const users = await this.prisma.user.findMany({
			orderBy: search ? { name: 'asc' } : undefined,
			where: this.withActiveFilter(where),
		});

		return users.map((user) => this.toDomain(user));
	}

	async findOneByEmail(email: string): Promise<UserModel | null> {
		const user = await this.prisma.user.findFirst({ where: this.withActiveFilter({ email }) });
		return user ? this.toDomain(user) : null;
	}

	async findOneById(id: string): Promise<UserModel | null> {
		const user = await this.prisma.user.findFirst({ where: this.withActiveFilter({ id }) });
		return user ? this.toDomain(user) : null;
	}

	async softDelete(id: string): Promise<UserModel> {
		const user = await this.prisma.user.update({ data: { deletedAt: new Date() }, where: { deletedAt: null, id } });
		return this.toDomain(user);
	}

	async updateOne(id: string, { birthday, ...data }: UpdateUserData): Promise<UserModel> {
		const user = await this.prisma.user.update({
			data: {
				...data,
				...(birthday && { birthday: new Date(birthday) }),
			},
			where: { id },
		});
		return this.toDomain(user);
	}

	private mapThemeToDomain(theme: UserThemePrisma): UserTheme {
		switch (theme) {
			case UserThemePrisma.dark:
				return UserTheme.Dark;
			case UserThemePrisma.light:
				return UserTheme.Light;
			default:
				throw new Error(`Unknown theme: ${theme}`);
		}
	}

	private toDomain(prismaUser: User): UserModel {
		return new UserModel({
			birthday: prismaUser.birthday?.toISOString().split('T')[0] || null,
			country: prismaUser.country,
			createdAt: prismaUser.createdAt,
			deletedAt: prismaUser.deletedAt,
			email: prismaUser.email,
			id: prismaUser.id,
			lastName: prismaUser.lastName,
			name: prismaUser.name,
			password: prismaUser.password,
			theme: this.mapThemeToDomain(prismaUser.theme),
		});
	}

	private withActiveFilter(where: Prisma.UserWhereInput): Prisma.UserWhereInput {
		return { ...where, deletedAt: null };
	}
}
