import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserModel } from '../../domain/model/user.model';
import { UserTheme } from '../../domain/user.enums';

@Exclude()
export class UserResponse {
	@ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
	@Expose()
	id: string;

	@ApiProperty({ example: 'user@example.com' })
	@Expose()
	email: string;

	@ApiProperty({ example: 'John' })
	@Expose()
	name: string;

	@ApiProperty({ example: 'Doe' })
	@Expose()
	lastName: string;

	@ApiPropertyOptional({ example: '1990-01-15' })
	@Expose()
	birthday?: string;

	@ApiPropertyOptional({ example: 'USA' })
	@Expose()
	country?: string;

	@ApiProperty({ description: 'User theme preference', enum: UserTheme, example: UserTheme.Light })
	@Expose()
	theme: UserTheme;

	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	@Expose()
	createdAt: Date;

	constructor(model: UserModel) {
		Object.assign(this, model);
	}
}
