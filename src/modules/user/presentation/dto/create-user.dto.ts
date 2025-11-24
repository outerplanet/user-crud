import { VALIDATION_LIMITS } from '@common/constants';
import { ToLowerCase, Trim } from '@common/transformers';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';

export class CreateUserDto {
	@ApiProperty({ example: 'user@example.com' })
	@Trim()
	@ToLowerCase()
	@IsEmail()
	email: string;

	@ApiProperty({
		example: 'SecureP@ssw0rd',
		maxLength: VALIDATION_LIMITS.PASSWORD.MAX,
		minLength: VALIDATION_LIMITS.PASSWORD.MIN,
	})
	@Trim()
	@Length(VALIDATION_LIMITS.PASSWORD.MIN, VALIDATION_LIMITS.PASSWORD.MAX)
	password: string;

	@ApiProperty({ example: 'John', maxLength: VALIDATION_LIMITS.NAME })
	@Trim()
	@IsNotEmpty()
	@MaxLength(VALIDATION_LIMITS.NAME)
	name: string;

	@ApiProperty({ example: 'Doe', maxLength: VALIDATION_LIMITS.NAME })
	@Trim()
	@IsNotEmpty()
	@MaxLength(VALIDATION_LIMITS.NAME)
	lastName: string;
}
