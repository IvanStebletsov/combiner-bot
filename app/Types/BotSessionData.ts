import { AuthStep } from "./AuthStep"

export interface BotSessionData {
	authStep?: AuthStep // Текущий этап
	messageForDeletion: number[]
	resolvePhone?: (phone: string) => void // Разрешить Promise для номера
	resolveCode?: (code: string) => void // Разрешить Promise для кода
	resolvePassword?: (password: string) => void // Для пароля
}
