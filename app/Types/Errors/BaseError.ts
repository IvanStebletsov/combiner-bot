import { AppError } from "./AppError"
import { ErrorCode } from "./ErrorCode"

export class BaseError extends Error implements AppError {
	constructor(
		public code: ErrorCode,
		message: string,
		public statusCode?: number,
		public details?: unknown
	) {
		super(message)
		this.name = this.constructor.name

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor)
		}
	}
}
