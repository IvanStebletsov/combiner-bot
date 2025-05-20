import { CoreUtils } from "../../Helpers/CoreUtils"
import { BaseError } from "./BaseError"
import { ErrorCode } from "./ErrorCode"

export class TelegramServiceError extends BaseError {
	constructor(
		code:
			| "user_not_authorized"
			| "no_chat_with_id"
			| "no_chats_in_folder"
			| "client_creation"
			| "invalid_api_creds"
			| "auth_key_duplicated"
			| ErrorCode,
		error?: any
	) {
		var message = "❌ Something went wrong"
		var errorCode = TelegramServiceError.makeErrorCode(0)

		switch (code) {
			case "user_not_authorized":
				errorCode = TelegramServiceError.makeErrorCode(1)
				message = `🙅🏻‍♂️  User is not authorized${CoreUtils.isNotEmpty(error) ? ` Error:\n${error}.` : `.`}`
				break
			case "no_chats_in_folder":
				errorCode = TelegramServiceError.makeErrorCode(2)
				message = `🤷🏻‍♂️  Thera are no chats in this folder.${CoreUtils.isNotEmpty(error) ? ` Error:\n${error}.` : `.`}`
				break
			case "client_creation":
				errorCode = TelegramServiceError.makeErrorCode(3)
				message = `⚙️  Telegtam Client creation has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
			case "invalid_api_creds":
				errorCode = TelegramServiceError.makeErrorCode(3)
				message = `🪪  Telegtam Client start has failed${CoreUtils.isNotEmpty(error) ? ` with the error:\n${error}.` : `.`}`
				break
		}

		super(code, message, errorCode)
	}

	private static makeErrorCode(code: number): number {
		return Number(`7317${code}`)
	}
}
