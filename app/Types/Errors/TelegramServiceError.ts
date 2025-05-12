import { BaseError } from "./BaseError"
import { ErrorCode } from "./ErrorCode"

export class TelegramServiceError extends BaseError {
	constructor(code: "no_api_id" | "no_api_hash" | "user_not_authorized" | ErrorCode) {
		var message = "❌ Something went wrong"
		var errorCode = TelegramServiceError.makeErrorCode(0)

		switch (code) {
			case "no_api_id":
				errorCode = TelegramServiceError.makeErrorCode(1)
				message = "🪪  There is no API ID"
				break
			case "no_api_hash":
				errorCode = TelegramServiceError.makeErrorCode(1)
				message = "#️⃣  There is no API Hash"
				break
			case "user_not_authorized":
				errorCode = TelegramServiceError.makeErrorCode(2)
				message = "🙅🏻‍♂️  User is not authorized"
				break
		}

		super(code, message, errorCode)
	}

	private static makeErrorCode(code: number): number {
		return Number(`7317${code}`)
	}
}
