import { CurrentUser } from '@modules/auth/presentation/auth.decorators';
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../application/user.service';
import { UserModel } from '../domain/model/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterQuery } from './query/user-filter.query';
import { UserResponse } from './response/user.response';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new user' })
	@ApiCreatedResponse({ description: 'User created successfully', type: UserResponse })
	@ApiBadRequestResponse({ description: 'Bad request - validation failed' })
	@ApiConflictResponse({ description: 'Conflict - user already exists' })
	async createUser(@Body() dto: CreateUserDto): Promise<UserResponse> {
		const user = await this.userService.createUser(dto);
		return new UserResponse(user);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a user (soft delete)' })
	@ApiNoContentResponse({ description: 'User deleted successfully' })
	@ApiNotFoundResponse({ description: 'User not found' })
	@ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
	async deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: UserModel): Promise<void> {
		await this.userService.deleteUser(id, currentUser);
	}

	@Get('me')
	@ApiOperation({ summary: 'Get current user' })
	@ApiOkResponse({ description: 'Current user', type: UserResponse })
	getCurrentUser(@CurrentUser() user: UserModel): UserResponse {
		return new UserResponse(user);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a user by ID' })
	@ApiOkResponse({ description: 'User found', type: UserResponse })
	@ApiNotFoundResponse({ description: 'User not found' })
	async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse> {
		const user = await this.userService.findUserByIdOrFail(id);
		return new UserResponse(user);
	}

	@Get()
	@ApiOperation({ summary: 'Get all users with optional filters and search' })
	@ApiOkResponse({ description: 'List of users', type: [UserResponse] })
	async getUsers(@Query() filter: UserFilterQuery): Promise<UserResponse[]> {
		const users = await this.userService.findUsers(filter);
		return users.map((user) => new UserResponse(user));
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a user' })
	@ApiOkResponse({ description: 'User updated successfully', type: UserResponse })
	@ApiNotFoundResponse({ description: 'User not found' })
	async updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto): Promise<UserResponse> {
		const user = await this.userService.updateUser(id, dto);
		return new UserResponse(user);
	}
}
