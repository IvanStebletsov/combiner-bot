import { Pool } from "pg"
import { UsersQueries } from "../../Database/SQLQueries/UsersQueries"
import { CoreLogger } from "../../Helpers/CoreLogger/CoreLogger"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { CoreUtils } from "../../Helpers/CoreUtils"
import { SettingsQueries } from "../../Database/SQLQueries/SettingsQueries"
import { CredentialsQueries } from "../../Database/SQLQueries/CredentialsQueries"

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
				CoreErrorHandler.handle(error)
				return Promise.reject(`Checking of the user existence with ID: ${userId} has failed.\n${error}`)
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
				return Promise.reject(`User with ID: ${userId} saving has failed.\n${error}`)
			})
	}

	/**
	 * Method returns user's lnaguage code
	 * @param userId User's id
	 * @param projectName Project name (database preffix)
	 * @returns A Promise with user's language code or null
	 */
	async languageCode(userId: number, projectName: string): Promise<string | undefined> {
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
					return Promise.resolve(undefined)
				}
			})
			.catch(() => {
				return Promise.resolve(undefined)
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
				return Promise.reject(
					`Language code: '${languageCode}' saving for user with ID: ${userId} has failed.\n${error}`
				)
			})
	}

	async apiId(userId: number): Promise<number | undefined> {
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
					return Promise.reject("API ID doens't exist")
				}
			})
			.catch(() => {
				return Promise.resolve(undefined)
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
				return Promise.reject(`API ID: ${apiId} saving for user with ID: ${userId} has failed.\n${error}`)
			})
	}

	async apiHash(userId: number): Promise<string | undefined> {
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
					return Promise.reject("API hash doens't exist")
				}
			})
			.catch(() => {
				return Promise.resolve(undefined)
			})
	}

	async saveApiHash(userId: number, apiHash: string): Promise<string | undefined> {
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
				return Promise.reject(`API Hash: ${apiHash} saving for user with ID: ${userId} has failed.\n${error}`)
			})
	}

	async session(userId: number): Promise<string | undefined> {
		const query = CredentialsQueries.session(userId)
		CoreLogger.log([
			{ text: `[SQL QUERY]:`, fg: "yellow" },
			{ text: ` ${CoreUtils.removeWhitespacesAndMultiSpaces(query)}` }
		])

		return this.database
			.query(query)
			.then((session) => {
				console.log("session", session.rows)
				if ((0 in session.rows, session.rows[0]["session"])) {
					return Promise.resolve(session.rows[0]["session"])
				} else {
					return Promise.reject("Session doesn't exist")
				}
			})
			.catch(() => {
				return Promise.resolve(undefined)
			})
	}

	async saveSession(userId: number, session: string): Promise<string | undefined> {
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
				return Promise.reject(`Session: ${session} saving for user with ID: ${userId} has failed.\n${error}`)
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
				return Promise.reject(`Last seen date updating user with ID: ${userId} has failed.\n${error}`)
			})
	}

	static supportedLanguages = ["ru", "en"]
}
