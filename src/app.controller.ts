import { Public } from '@modules/auth/presentation/auth.decorators';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
	@Public()
	@Get()
	getHello(): string {
		return 'Hello World!';
	}
}
