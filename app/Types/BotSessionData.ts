interface BotSessionData {
	authStep?: "app_id" | "app_hash" | "phone" | "code" | "password" // Текущий этап
	messageForDeletion: number[]
	resolvePhone?: (phone: string) => void // Разрешить Promise для номера
	resolveCode?: (code: string) => void // Разрешить Promise для кода
	resolvePassword?: (password: string) => void // Для пароля
}
