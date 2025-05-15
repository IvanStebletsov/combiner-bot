import { CoreUtils } from "../../Helpers/CoreUtils"
import { BaseError } from "./BaseError"
import { ErrorCode } from "./ErrorCode"

export class UserServiceError extends BaseError {
	constructor(
		code:
			| "checking_user_existance"
			| "saving_user"
			| "fetching_language_code"
			| "saving_language_code"
			| "fetching_api_id"
			| "saving_api_id"
			| "fetching_api_hash"
			| "saving_api_hash"
			| "fetching_session"
			| "saving_session"
			| "last_seen_date_update"
			| ErrorCode,
		userId: number,
		error?: any
	) {
		var message = "❌ Something went wrong"
		var errorCode = UserServiceError.makeErrorCode(0)

		switch (code) {
			case "checking_user_existance":
				errorCode = UserServiceError.makeErrorCode(1)
				message = `🤷🏻‍♂️  Checking of the user existence with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "saving_user":
				errorCode = UserServiceError.makeErrorCode(2)
				message = `👤  User with ID: ${userId} saving has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "fetching_language_code":
				errorCode = UserServiceError.makeErrorCode(3)
				message = `🌐  Fetching language code for the user with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "saving_language_code":
				errorCode = UserServiceError.makeErrorCode(4)
				message = `🌐  Language code saving for user the with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "fetching_api_id":
				errorCode = UserServiceError.makeErrorCode(5)
				message = `🪪  Fetching the API ID for the user the with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "saving_api_id":
				errorCode = UserServiceError.makeErrorCode(6)
				message = `🪪  Saving the API ID for the user the with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "fetching_api_hash":
				errorCode = UserServiceError.makeErrorCode(7)
				message = `#️⃣  Fetching the API Hash for the user the with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "saving_api_hash":
				errorCode = UserServiceError.makeErrorCode(8)
				message = `#️⃣  Saving the API Hash for the user the with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "fetching_session":
				errorCode = UserServiceError.makeErrorCode(9)
				message = `🚦  Fetching the API Session for the user the with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "saving_session":
				errorCode = UserServiceError.makeErrorCode(10)
				message = `🚦  Saving the API Session for the user the with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "last_seen_date_update":
				errorCode = UserServiceError.makeErrorCode(11)
				message = `🚦  Last seen date update for the user the with ID: ${userId} has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
		}

		super(code, message, errorCode)
	}

	private static makeErrorCode(code: number): number {
		return Number(`053${code}`)
	}
}
