import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CreateUserData } from '../domain/data/create-user.data';
import { UpdateUserData } from '../domain/data/update-user.data';
import { UserFilter } from '../domain/filter/user.filter';
import { UserModel } from '../domain/model/user.model';
import { USER_REPOSITORY } from '../domain/repository/user.repository.interface';
import { UserTheme } from '../domain/user.enums';
import { UserService } from './user.service';

// Mock bcrypt
jest.mock('bcrypt');

describe('UserService', () => {
	let service: UserService;

	const mockUserRepository = {
		create: jest.fn(),
		find: jest.fn(),
		findOneByEmail: jest.fn(),
		findOneById: jest.fn(),
		softDelete: jest.fn(),
		updateOne: jest.fn(),
	};

	const mockUser: UserModel = {
		birthday: '1990-01-15',
		country: 'USA',
		createdAt: new Date(),
		deletedAt: null,
		email: 'test@example.com',
		id: '123e4567-e89b-12d3-a456-426614174000',
		lastName: 'Doe',
		name: 'John',
		password: 'hashedPassword123',
		theme: UserTheme.Light,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: USER_REPOSITORY,
					useValue: mockUserRepository,
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);

		// Clear all mocks before each test
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createUser', () => {
		const createUserDto: CreateUserData = {
			email: 'newuser@example.com',
			lastName: 'Smith',
			name: 'Jane',
			password: 'SecurePassword123',
		};

		it('should create a user successfully', async () => {
			const hashedPassword = 'hashedPassword';
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
			mockUserRepository.create.mockResolvedValue(mockUser);

			const result = await service.createUser(createUserDto);

			expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
			expect(mockUserRepository.create).toHaveBeenCalledWith({
				email: createUserDto.email,
				lastName: createUserDto.lastName,
				name: createUserDto.name,
				password: hashedPassword,
			});
			expect(result).toEqual(mockUser);
		});

		it('should throw ConflictException with specific message when email already exists', async () => {
			const hashedPassword = 'hashedPassword';
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

			const uniqueError = {
				code: 'P2002',
				detail: 'Key (email)=(newuser@example.com) already exists.',
				meta: { target: ['email'] },
			};
			mockUserRepository.create.mockRejectedValue(uniqueError);

			await expect(service.createUser(createUserDto)).rejects.toThrow(
				new ConflictException('This email address is already used'),
			);
		});

		it('should rethrow non-unique constraint errors', async () => {
			const hashedPassword = 'hashedPassword';
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

			const otherError = new Error('Database connection failed');
			mockUserRepository.create.mockRejectedValue(otherError);

			await expect(service.createUser(createUserDto)).rejects.toThrow('Database connection failed');
		});
	});

	describe('deleteUser', () => {
		const initiator: UserModel = { ...mockUser, id: '123e4567-e89b-12d3-a456-426614174000' };

		it('should delete user successfully when user deletes their own account', async () => {
			mockUserRepository.findOneById.mockResolvedValue(mockUser);
			mockUserRepository.softDelete.mockResolvedValue({ ...mockUser, deletedAt: new Date() });

			const result = await service.deleteUser(mockUser.id, initiator);

			expect(mockUserRepository.findOneById).toHaveBeenCalledWith(mockUser.id);
			expect(mockUserRepository.softDelete).toHaveBeenCalledWith(mockUser.id);
			expect(result.deletedAt).toBeDefined();
		});

		it('should throw NotFoundException when user does not exist', async () => {
			mockUserRepository.findOneById.mockResolvedValue(null);

			await expect(service.deleteUser('non-existent-id', initiator)).rejects.toThrow(NotFoundException);
			expect(mockUserRepository.softDelete).not.toHaveBeenCalled();
		});

		it('should throw ForbiddenException when user tries to delete another user', async () => {
			const differentUser = { ...mockUser, id: 'different-id' };
			mockUserRepository.findOneById.mockResolvedValue(differentUser);

			await expect(service.deleteUser(differentUser.id, initiator)).rejects.toThrow(ForbiddenException);
			expect(mockUserRepository.softDelete).not.toHaveBeenCalled();
		});
	});

	describe('findUserByEmail', () => {
		it('should find user by email', async () => {
			mockUserRepository.findOneByEmail.mockResolvedValue(mockUser);

			const result = await service.findUserByEmail('test@example.com');

			expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith('test@example.com');
			expect(result).toEqual(mockUser);
		});

		it('should return null when user not found', async () => {
			mockUserRepository.findOneByEmail.mockResolvedValue(null);

			const result = await service.findUserByEmail('nonexistent@example.com');

			expect(result).toBeNull();
		});
	});

	describe('findUserById', () => {
		it('should find user by id', async () => {
			mockUserRepository.findOneById.mockResolvedValue(mockUser);

			const result = await service.findUserById(mockUser.id);

			expect(mockUserRepository.findOneById).toHaveBeenCalledWith(mockUser.id);
			expect(result).toEqual(mockUser);
		});

		it('should return null when user not found', async () => {
			mockUserRepository.findOneById.mockResolvedValue(null);

			const result = await service.findUserById('non-existent-id');

			expect(result).toBeNull();
		});
	});

	describe('findUserByIdOrFail', () => {
		it('should find user by id', async () => {
			mockUserRepository.findOneById.mockResolvedValue(mockUser);

			const result = await service.findUserByIdOrFail(mockUser.id);

			expect(mockUserRepository.findOneById).toHaveBeenCalledWith(mockUser.id);
			expect(result).toEqual(mockUser);
		});

		it('should throw NotFoundException when user not found', async () => {
			mockUserRepository.findOneById.mockResolvedValue(null);

			await expect(service.findUserByIdOrFail('non-existent-id')).rejects.toThrow(NotFoundException);
		});
	});

	describe('findUsers', () => {
		it('should find users with filters', async () => {
			const filter: UserFilter = { search: 'john' };
			const users = [mockUser];
			mockUserRepository.find.mockResolvedValue(users);

			const result = await service.findUsers(filter);

			expect(mockUserRepository.find).toHaveBeenCalledWith(filter);
			expect(result).toEqual(users);
		});

		it('should find all users when no filter provided', async () => {
			const filter: UserFilter = {};
			const users = [mockUser];
			mockUserRepository.find.mockResolvedValue(users);

			const result = await service.findUsers(filter);

			expect(mockUserRepository.find).toHaveBeenCalledWith(filter);
			expect(result).toEqual(users);
		});
	});

	describe('updateUser', () => {
		const updateUserDto: UpdateUserData = {
			country: 'Canada',
			name: 'Jane',
		};

		it('should update user successfully', async () => {
			const updatedUser = { ...mockUser, ...updateUserDto };
			mockUserRepository.findOneById.mockResolvedValue(mockUser);
			mockUserRepository.updateOne.mockResolvedValue(updatedUser);

			const result = await service.updateUser(mockUser.id, updateUserDto);

			expect(mockUserRepository.findOneById).toHaveBeenCalledWith(mockUser.id);
			expect(mockUserRepository.updateOne).toHaveBeenCalledWith(mockUser.id, updateUserDto);
			expect(result).toEqual(updatedUser);
		});

		it('should throw NotFoundException when user does not exist', async () => {
			mockUserRepository.findOneById.mockResolvedValue(null);

			await expect(service.updateUser('non-existent-id', updateUserDto)).rejects.toThrow(NotFoundException);
			expect(mockUserRepository.updateOne).not.toHaveBeenCalled();
		});

		it('should hash password when updating password', async () => {
			const updateWithPassword: UpdateUserData = { password: 'NewPassword123' };
			const hashedPassword = 'newHashedPassword';
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

			mockUserRepository.findOneById.mockResolvedValue(mockUser);
			mockUserRepository.updateOne.mockResolvedValue(mockUser);

			await service.updateUser(mockUser.id, updateWithPassword);

			expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123', 12);
			expect(mockUserRepository.updateOne).toHaveBeenCalledWith(mockUser.id, {
				password: hashedPassword,
			});
		});

		it('should update birthday when provided', async () => {
			const updateWithBirthday: UpdateUserData = { birthday: '1995-05-15' };

			mockUserRepository.findOneById.mockResolvedValue(mockUser);
			mockUserRepository.updateOne.mockResolvedValue(mockUser);

			await service.updateUser(mockUser.id, updateWithBirthday);

			expect(mockUserRepository.updateOne).toHaveBeenCalledWith(mockUser.id, {
				birthday: '1995-05-15',
			});
		});

		it('should handle multiple fields including password and birthday', async () => {
			const complexUpdate: UpdateUserData = {
				birthday: '1992-03-20',
				country: 'UK',
				name: 'Updated',
				password: 'ComplexPass123',
			};
			const hashedPassword = 'complexHashedPassword';
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

			mockUserRepository.findOneById.mockResolvedValue(mockUser);
			mockUserRepository.updateOne.mockResolvedValue(mockUser);

			await service.updateUser(mockUser.id, complexUpdate);

			expect(bcrypt.hash).toHaveBeenCalledWith('ComplexPass123', 12);
			expect(mockUserRepository.updateOne).toHaveBeenCalledWith(mockUser.id, {
				birthday: '1992-03-20',
				country: 'UK',
				name: 'Updated',
				password: hashedPassword,
			});
		});

		it('should throw ConflictException with specific message when updating to existing email', async () => {
			const updateWithEmail: UpdateUserData = { email: 'existing@example.com' };

			const uniqueError = {
				code: 'P2002',
				detail: 'Key (email)=(existing@example.com) already exists.',
				meta: { target: ['email'] },
			};

			mockUserRepository.findOneById.mockResolvedValue(mockUser);
			mockUserRepository.updateOne.mockRejectedValue(uniqueError);

			await expect(service.updateUser(mockUser.id, updateWithEmail)).rejects.toThrow(
				new ConflictException('This email address is already used'),
			);
		});

		it('should rethrow non-unique constraint errors during update', async () => {
			const updateDto: UpdateUserData = { name: 'Jane' };
			const otherError = new Error('Database connection failed');

			mockUserRepository.findOneById.mockResolvedValue(mockUser);
			mockUserRepository.updateOne.mockRejectedValue(otherError);

			await expect(service.updateUser(mockUser.id, updateDto)).rejects.toThrow('Database connection failed');
		});
	});
});
