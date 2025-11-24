import { UserService } from '@modules/user/application/user.service';
import { UserModel } from '@modules/user/domain/model/user.model';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private userService: UserService,
	) {
		super({
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>('JWT_SECRET')!,
		});
	}

	async validate({ sub }: { sub: string }): Promise<UserModel> {
		const user = await this.userService.findUserById(sub);

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		return user;
	}
}
