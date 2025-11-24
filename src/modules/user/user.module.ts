import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { USER_REPOSITORY } from './domain/repository/user.repository.interface';
import { UserRepository } from './infrastructure/user.repository';
import { UserController } from './presentation/user.controller';

@Module({
	controllers: [UserController],
	exports: [UserService],
	imports: [],
	providers: [{ provide: USER_REPOSITORY, useClass: UserRepository }, UserService],
})
export class UserModule {}
