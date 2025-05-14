import { Pool } from "pg"
import { Bot } from "grammy"
import { CoreCache } from "../Cache/CoreCache"
import { CacheMiddleware } from "../Cache/CacheMiddleware"
import { UsersService } from "../Services/UserService/UserService"
import { MessageHandler } from "../Handlers/MessageHandler/MessageHandler"
import { CommandHandler } from "../Handlers/CommandHandler/CommandHandler"
import { CallbackHandler } from "../Handlers/CallbackHandler/CallbackHandler"
import { LastSeenMiddleware } from "../Handlers/LastSeenMiddleware/LastSeenMiddleware"
import { TelegramService } from "../Services/TelegramService/TelegramService"
import { State } from "./State"
import { BotContext } from "../Types/BotContext"
import { GPTService } from "../Services/GPTService/GPTService"

export class Assembly {
	static shared = new Assembly()

	bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_API_TOKEN!)
	database = new Pool({
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DATABASE_NAME,
		host: process.env.POSTGRES_HOST,
		port: Number(process.env.POSTGRES_PORT)
	})
	state = new State()
	gptService = new GPTService()
	usersService = new UsersService(this.database)
	telegramService = new TelegramService(this.usersService, this.state)
	commandHandler = new CommandHandler(this.usersService, this.telegramService, this.gptService)
	lastSeenMiddleware = new LastSeenMiddleware(this.usersService)
	cacheMiddleware = new CacheMiddleware(this.usersService, CoreCache.shared)
	callbackHandler = new CallbackHandler(this.usersService, this.telegramService)
	messageHandler = new MessageHandler(this.callbackHandler)
}
