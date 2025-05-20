import * as dotenv from "dotenv"
import { session } from "grammy"
import { run } from "@grammyjs/runner"
import { Assembly } from "./Helpers/Assembly"
import { Command } from "./Handlers/CommandHandler/Command"
import { CoreLogger } from "./Helpers/CoreLogger/CoreLogger"
import { CoreErrorHandler } from "./Helpers/CoreErrorHandler"
import { CallbackQuery } from "./Handlers/CallbackHandler/CallbackQuery"
import { generateUpdateMiddleware } from "telegraf-middleware-console-time/dist"
import { TablesQueries as tablesQueries } from "./Database/SQLQueries/TablesQueries"
import { BotSessionData } from "./Types/BotSessionData"

dotenv.config()

class App {
	private bot = Assembly.shared.bot
	private database = Assembly.shared.database
	private commandHandler = Assembly.shared.commandHandler
	private lastSeenMiddleware = Assembly.shared.lastSeenMiddleware
	private cacheMiddleware = Assembly.shared.cacheMiddleware
	private callbackHandler = Assembly.shared.callbackHandler
	private messageHandler = Assembly.shared.messageHandler

	async main() {
		this.bot.use(session({ initial: (): BotSessionData => ({ messageForDeletion: [] }) }))

		// Middleware
		this.bot.use(generateUpdateMiddleware())
		this.bot.use((context, next) => this.lastSeenMiddleware.handleLastSeenDate(context, next))
		this.bot.use((context, next) => this.cacheMiddleware.handleCache(context, next))

		// Commands
		this.bot.command(Command.Start, (context) => {
			if (context.message) {
				context.session.messageForDeletion.push(context.message.message_id)
			}
			this.commandHandler.handleStart(context)
		})
		this.bot.command(Command.ListOfFolders, (context) => {
			if (context.message) {
				context.session.messageForDeletion.push(context.message.message_id)
			}
			this.commandHandler.handleListOfFolders(context)
		})
		this.bot.command(Command.ListOfAllChats, (context) => {
			if (context.message) {
				context.session.messageForDeletion.push(context.message.message_id)
			}
			this.commandHandler.handleListOfAllChats(context)
		})
		this.bot.command(Command.ListOfAllUnreadedChats, (context) => {
			if (context.message) {
				context.session.messageForDeletion.push(context.message.message_id)
			}
			this.commandHandler.handleListOfAllUnreadedChats(context)
		})
		this.bot.command(Command.HowToGrantAccess, (context) => {
			if (context.message) {
				context.session.messageForDeletion.push(context.message.message_id)
			}
			this.commandHandler.handleHowToGrantAccess(context)
		})
		this.bot.command(Command.Authorize, (context) => {
			if (context.message) {
				context.session.messageForDeletion.push(context.message.message_id)
			}
			this.callbackHandler.handleAuthorize(context)
		})
		this.bot.command(Command.ClearMyIds, (context) => {
			if (context.message) {
				context.session.messageForDeletion.push(context.message.message_id)
			}
			this.commandHandler.handleClearIds(context)
		})

		// Handle events
		this.bot.callbackQuery(CallbackQuery.GiveAppCreds().regex, (context) =>
			this.callbackHandler.handleGiveAppCreds(context)
		)
		this.bot.callbackQuery(CallbackQuery.GiveAuthCreds().regex, (context) =>
			this.callbackHandler.handleGiveAuthCreds(context)
		)
		this.bot.callbackQuery(CallbackQuery.Authorize().regex, (context) => this.callbackHandler.handleAuthorize(context))
		this.bot.callbackQuery(CallbackQuery.HowToGrantAccess().regex, (context) =>
			this.commandHandler.handleHowToGrantAccess(context)
		)
		this.bot.callbackQuery(CallbackQuery.ListOfFolders().regex, (context) =>
			this.commandHandler.handleListOfFolders(context)
		)
		this.bot.callbackQuery(CallbackQuery.ListOfChats().regex, (context) =>
			this.commandHandler.handleListOfChats(context)
		)
		this.bot.callbackQuery(CallbackQuery.ReadUnreadChatMessages().regex, (context) =>
			this.commandHandler.handleReadUnreadChatMessages(context)
		)
		this.bot.callbackQuery(CallbackQuery.DeleteMessage().regex, (context) =>
			this.callbackHandler.handleDeleteMessage(context)
		)

		// Messages
		this.bot.on("message", (context) => this.messageHandler.handleMessage(context))

		this.bot.catch((error) => CoreErrorHandler.handle(error))

		// Connect to database
		this.database.connect()

		// Database establishment
		await this.setupDatabase()

		// Bot launch
		run(this.bot)
	}

	async setupDatabase(): Promise<any> {
		if (!process.env.PROJECT_NAME) {
			console.error("PROJECT_NAME is not defined")
			return Promise.resolve(undefined)
		}
		return this.database
			.query(tablesQueries.createUsers)
			.then(() => {
				CoreLogger.log([{ text: `[DATABASE]:`, fg: "yellow" }, { text: ` Users table created successfully.` }])
				return this.database.query(tablesQueries.createTelegramClientCredentials)
			})
			.then(() => {
				CoreLogger.log([{ text: `[DATABASE]:`, fg: "yellow" }, { text: ` Messages table created successfully.` }])
				return this.database.query(tablesQueries.createSettings(process.env.PROJECT_NAME!))
			})
			.then(() => {
				CoreLogger.log([
					{ text: `[DATABASE]:`, fg: "yellow" },
					{ text: ` Telegram Client Credentials table created successfully.` }
				])
				return new Promise((resolve) => resolve(undefined))
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}
}

new App().main()
