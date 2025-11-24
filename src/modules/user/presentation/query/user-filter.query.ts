import { ToLowerCase, Trim } from '@common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserFilterQuery {
	@ApiPropertyOptional({ example: 'user@example.com' })
	@Trim()
	@ToLowerCase()
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ example: 'USA' })
	@Trim()
	@IsOptional()
	@IsString()
	country?: string;

	@ApiPropertyOptional({ description: 'Search query to filter users by name or last name', example: 'John' })
	@Trim()
	@IsOptional()
	@IsString()
	search?: string;
}
