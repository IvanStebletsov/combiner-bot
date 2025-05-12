import { ErrorCode } from "./ErrorCode"

export interface AppError extends Error {
	code: ErrorCode // Уникальный идентификатор ошибки
	message: string // Сообщение для разработчика/пользователя
	statusCode?: number // HTTP-статус (если нужно)
	details?: unknown // Дополнительные данные (опционально)
}
