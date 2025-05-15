import { Pool } from "pg"
import { UsersQueries } from "../../Database/SQLQueries/UsersQueries"
import { CoreLogger } from "../../Helpers/CoreLogger/CoreLogger"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { CoreUtils } from "../../Helpers/CoreUtils"
import { SettingsQueries } from "../../Database/SQLQueries/SettingsQueries"
import { CredentialsQueries } from "../../Database/SQLQueries/CredentialsQueries"
import { UserServiceError } from "../../Types/Errors/UserServiceError"

export class UsersService {
	database: Pool

	constructor(database: Pool) {
		this.database = database
	}

	/**
	 * Method checks does user exist in the database
	 * @param userId User's id
	 * @returns true if user exists
	 */
	async userExists(userId: number): Promise<boolean> {
		const query = UsersQueries.userExists(userId)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then((users) => {
				return Promise.resolve(users.rowCount != 0)
			})
			.catch(async (error) => {
				const specifiedError = new UserServiceError("checking_user_existance", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	/**
	 * Method saves user to the database
	 * @param userId User's id
	 * @param firstName User's first name
	 * @param lastName User's last name
	 * @param username User's telegram username
	 * @param languageCode User's telegram language
	 * @param projectName Project name (database preffix)
	 * @returns A Promise with undefined or error
	 */
	async saveUser(
		userId: number,
		firstName: string,
		lastName: string | undefined,
		username: string | undefined,
		languageCode: string,
		projectName: string
	): Promise<undefined> {
		if (!UsersService.supportedLanguages.includes(languageCode)) {
			languageCode = UsersService.supportedLanguages[0]
		}

		const query = UsersQueries.save(userId, firstName, lastName, username, projectName)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then(async () => {
				if (!(await this.languageCode(userId, projectName))) {
					return await this.saveLanguageCode(userId, languageCode, projectName)
				}
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("saving_user", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	/**
	 * Method returns user's lnaguage code
	 * @param userId User's id
	 * @param projectName Project name (database preffix)
	 * @returns A Promise with user's language code or null
	 */
	async languageCode(userId: number, projectName: string): Promise<string> {
		const query = SettingsQueries.languageCode(userId, projectName)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then((languageCode) => {
				if (0 in languageCode.rows) {
					return Promise.resolve(languageCode.rows[0]["language_code"])
				} else {
					return Promise.reject(undefined)
				}
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("fetching_language_code", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	/**
	 * Method saves user's language code
	 * @param userId User's id
	 * @param languageCode User's language code
	 * @param projectName Project name (database preffix)
	 * @returns A Promise with undefined or error
	 */
	async saveLanguageCode(userId: number, languageCode: string, projectName: string): Promise<undefined> {
		if (!UsersService.supportedLanguages.includes(languageCode)) {
			languageCode = UsersService.supportedLanguages[0]
		}

		const query = SettingsQueries.saveLanguageCode(userId, languageCode, projectName)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then(() => {
				return Promise.resolve(undefined)
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("saving_language_code", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	async apiId(userId: number): Promise<number> {
		const query = CredentialsQueries.apiId(userId)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then((apiId) => {
				if ((0 in apiId.rows, parseInt(apiId.rows[0]["api_id"]))) {
					return Promise.resolve(parseInt(apiId.rows[0]["api_id"]))
				} else {
					return Promise.reject(undefined)
				}
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("fetching_api_id", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	async saveApiId(userId: number, apiId: number): Promise<number | undefined> {
		const query = CredentialsQueries.saveApiId(userId, apiId)

		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then(() => {
				return Promise.resolve(apiId)
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("saving_api_id", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	async apiHash(userId: number): Promise<string> {
		const query = CredentialsQueries.apiHash(userId)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then((apiHash) => {
				if ((0 in apiHash.rows, apiHash.rows[0]["api_hash"])) {
					return Promise.resolve(apiHash.rows[0]["api_hash"])
				} else {
					return Promise.reject(undefined)
				}
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("fetching_api_hash", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	async saveApiHash(userId: number, apiHash: string): Promise<string> {
		const query = CredentialsQueries.saveApiHash(userId, apiHash)

		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then(() => {
				return Promise.resolve(apiHash)
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("saving_api_hash", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	async session(userId: number): Promise<string> {
		const query = CredentialsQueries.session(userId)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then((session) => {
				console.log(session)
				if ((0 in session.rows, session.rows[0]["session"])) {
					return Promise.resolve(session.rows[0]["session"])
				} else {
					return Promise.reject(undefined)
				}
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("fetching_session", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	async saveSession(userId: number, session: string): Promise<string> {
		const query = CredentialsQueries.saveSession(userId, session)

		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then(() => {
				return Promise.resolve(session)
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("saving_session", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	/**
	 * Method updates user's last seen date
	 * @param userId User's id
	 * @returns A Promise with undefined or error
	 */
	async updateLastSeeDate(userId: number): Promise<undefined> {
		const query = UsersQueries.updateLastSeeDate(userId)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then(() => {
				return Promise.resolve(undefined)
			})
			.catch((error) => {
				const specifiedError = new UserServiceError("last_seen_date_update", userId, error)
				CoreErrorHandler.handle(specifiedError)
				return Promise.reject(specifiedError)
			})
	}

	static supportedLanguages = ["ru", "en"]
}
