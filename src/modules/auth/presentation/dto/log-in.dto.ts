import { ApiProperty } from '@nestjs/swagger';

export class LogInDto {
	@ApiProperty({ example: 'user@example.com' })
	email: string;

	@ApiProperty({ example: 'SecureP@ssw0rd' })
	password: string;
}
