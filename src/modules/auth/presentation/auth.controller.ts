import { UserModel } from '@modules/user/domain/model/user.model';
import { CreateUserDto } from '@modules/user/presentation/dto/create-user.dto';
import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppConfigService } from '@shared/config/app-config.service';
import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';
import { Public, SkipExpiredTokenCheck } from './auth.decorators';
import { LogInDto } from './dto/log-in.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { AuthResponse } from './response/auth.response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private configService: AppConfigService,
	) {}

	@Public()
	@UseGuards(LocalAuthGuard)
	@Post('log-in')
	@ApiOperation({ summary: 'Log in with email and password' })
	@ApiOkResponse({ description: 'Successfully logged in', type: AuthResponse })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async logIn(
		@Body() dto: LogInDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthResponse> {
		const user = req.user as UserModel;
		const { accessToken, refreshToken } = await this.authService.logIn(user.id);
		this.setRefreshTokenCookie(refreshToken, res);

		return new AuthResponse({ accessToken, user });
	}

	@Post('log-out')
	@ApiOperation({ summary: 'Log out and clear refresh token' })
	@ApiOkResponse({ description: 'Successfully logged out' })
	@ApiUnauthorizedResponse({ description: 'Missing refresh token' })
	async logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{ success: boolean }> {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token not found');
		}

		await this.authService.logOut(refreshToken);
		res.clearCookie('refreshToken');

		return { success: true };
	}

	@SkipExpiredTokenCheck()
	@Public()
	@Post('refresh-token')
	@ApiOperation({ summary: 'Refresh access token using refresh token' })
	@ApiOkResponse({ description: 'Successfully refreshed token' })
	@ApiUnauthorizedResponse({ description: 'Invalid or missing refresh token' })
	async refreshToken(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<{ accessToken: string }> {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token not found');
		}

		const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);
		this.setRefreshTokenCookie(newRefreshToken, res);

		return { accessToken };
	}

	@Public()
	@Post('sign-up')
	@ApiOperation({ summary: 'Sign up a new user' })
	@ApiCreatedResponse({ description: 'Successfully signed up', type: AuthResponse })
	@ApiBadRequestResponse({ description: 'Bad request' })
	async signUp(@Body() dto: CreateUserDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
		const { accessToken, refreshToken, user } = await this.authService.signUp(dto);
		this.setRefreshTokenCookie(refreshToken, res);

		return new AuthResponse({ accessToken, user });
	}

	private setRefreshTokenCookie(refreshToken: string, res: Response): void {
		const isProduction = this.configService.nodeEnv === 'production';

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			sameSite: 'strict',
			secure: isProduction,
		});
	}
}
