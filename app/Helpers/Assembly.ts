import { MessageHandler } from "../Handlers/MessageHandler/MessageHandler"
import { Bot } from "grammy"
import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions"

export class Assembly {
	static shared = new Assembly()

	apiId = 20184716
	apiHash = "73eedc90e0e16334069a2a8aab4fa70b"
	stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNDEBu2Hyn+KVdVanPRZ55WAK9f7tIqbiK2kD2wQyWB2jIbOFuGfcZacYFhI+/DAgCxw6SZyUVoWZm+3ZT1l9xI5TpfGHSS9rMiOtsx4dtww2jIO810V/KySWI3Z32f6xzA27TZnRs0UF6wSGmgVKX7eLw9JMY2qx9qNivRo7W2kIZaidaDHphEkiUrojm3JTr9dgSCRLDeaNQOFeGU/eiYnrssFymnj9cItKMGOZhSrkytXoUwgVd4civk/oID2U0sOZ1S6RukGP/Zrn8+95HQwnPq6bqIvk90U7i+l+K+D3S40FjISMkuXAAxkD7E6GPOw7foCfRmqw2iapHm36SfDRLIQ=")
	
	bot = new Bot(process.env.TELEGRAM_BOT_API_TOKEN!)
	client = new TelegramClient(
		this.stringSession, 
		this.apiId, 
		this.apiHash, 
		{ connectionRetries: 5 }
	)

	messageHandler = new MessageHandler()
}
