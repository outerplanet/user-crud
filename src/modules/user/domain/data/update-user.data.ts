import { UserTheme } from '../user.enums';

export interface UpdateUserData {
	birthday?: string;
	country?: string;
	email?: string;
	lastName?: string;
	name?: string;
	password?: string;
	theme?: UserTheme;
}
