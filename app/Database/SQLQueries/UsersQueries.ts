import { CoreUtils } from "../../Helpers/CoreUtils"

export class UsersQueries {
	static userExists(userId: number): string {
		return `SELECT id FROM users WHERE id = ${userId}`
	}

	static save(
		userId: number,
		firstName: string,
		lastName: string | undefined,
		username: string | undefined,
		projectName: string
	): string {
		return `
		INSERT INTO 
			users (id, first_name, last_name, username, last_seen_date, registration_date, role, registration_bot)
		VALUES (
			${userId}, 
			E'${CoreUtils.escape(firstName)}', 
			${lastName ? `E'${CoreUtils.escape(lastName)}'` : null}, 
			${username ? `E'${CoreUtils.escape(username)}'` : null}, 
			CURRENT_TIMESTAMP, 
			CURRENT_TIMESTAMP, 
			'user', 
			'${projectName}'
			) ON CONFLICT (id) 
		DO UPDATE 
		SET 
		first_name = E'${CoreUtils.escape(firstName)}', 
		last_name = ${lastName ? `E'${CoreUtils.escape(lastName)}'` : null}, 
		username = ${username ? `E'${CoreUtils.escape(username)}'` : null}
		`
	}

	static updateLastSeeDate(userId: number): string {
		return `UPDATE users SET last_seen_date = CURRENT_TIMESTAMP WHERE id = ${userId}`
	}

	static usersRole(userId: number): string {
		return `SELECT role FROM users WHERE id = ${userId}`
	}
}