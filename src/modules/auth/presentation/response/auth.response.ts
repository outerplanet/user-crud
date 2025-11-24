import { UserModel } from '@modules/user/domain/model/user.model';
import { UserResponse } from '@modules/user/presentation/response/user.response';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AuthResponse {
	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
	@Expose()
	accessToken: string;

	@ApiProperty()
	@Expose()
	user: UserResponse;

	constructor(model: { accessToken: string; user: UserModel }) {
		Object.assign(this, model);
	}
}
