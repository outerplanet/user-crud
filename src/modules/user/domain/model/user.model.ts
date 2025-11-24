import { UserTheme } from '../user.enums';

export class UserModel {
	id: string;

	email: string;

	password: string;

	name: string;

	lastName: string;

	birthday: string | null;

	country: string | null;

	theme: UserTheme;

	createdAt: Date;

	deletedAt: Date | null;

	constructor(props: UserModel) {
		Object.assign(this, props);
	}
}
