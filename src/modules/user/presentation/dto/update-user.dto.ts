import { VALIDATION_LIMITS } from '@common/constants';
import { ToLowerCase, Trim } from '@common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, Length, MaxLength } from 'class-validator';
import { UserTheme } from '../../domain/user.enums';

export class UpdateUserDto {
	@ApiPropertyOptional({ example: 'newemail@example.com' })
	@Trim()
	@ToLowerCase()
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({
		example: 'NewSecureP@ss',
		maxLength: VALIDATION_LIMITS.PASSWORD.MAX,
		minLength: VALIDATION_LIMITS.PASSWORD.MIN,
	})
	@Trim()
	@IsOptional()
	@Length(VALIDATION_LIMITS.PASSWORD.MIN, VALIDATION_LIMITS.PASSWORD.MAX)
	password?: string;

	@ApiPropertyOptional({ example: 'Jane', maxLength: VALIDATION_LIMITS.NAME })
	@Trim()
	@IsOptional()
	@IsNotEmpty()
	@MaxLength(VALIDATION_LIMITS.NAME)
	name?: string;

	@ApiPropertyOptional({ example: 'Smith', maxLength: VALIDATION_LIMITS.NAME })
	@Trim()
	@IsOptional()
	@IsNotEmpty()
	@MaxLength(VALIDATION_LIMITS.NAME)
	lastName?: string;

	@ApiPropertyOptional({ example: '1990-01-15' })
	@IsOptional()
	@IsDateString({ strict: true })
	@IsNotEmpty()
	birthday?: string;

	@ApiPropertyOptional({ example: 'Canada', maxLength: VALIDATION_LIMITS.COUNTRY })
	@Trim()
	@IsOptional()
	@IsNotEmpty()
	@MaxLength(VALIDATION_LIMITS.COUNTRY)
	country?: string;

	@ApiPropertyOptional({ enum: UserTheme, example: UserTheme.Dark })
	@IsOptional()
	@IsEnum(UserTheme)
	theme?: UserTheme;
}
