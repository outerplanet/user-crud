import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserSessionService } from './user-session.service';

@Injectable()
export class UserSessionCleanupService {
	private readonly logger = new Logger(UserSessionCleanupService.name);

	constructor(private userSessionService: UserSessionService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleCleanup(): Promise<void> {
		this.logger.log('Starting expired session cleanup...');

		try {
			const deletedCount = await this.userSessionService.deleteExpiredSessions();
			this.logger.log(`Cleanup completed. Deleted ${deletedCount} expired sessions.`);
		} catch (error) {
			this.logger.error('Error during session cleanup:', error);
		}
	}
}
