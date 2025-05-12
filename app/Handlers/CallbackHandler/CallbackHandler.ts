import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { Localized } from "../../Resources/Localizations/Localized"
import { UsersService } from "../../Services/UserService/UserService"
import { TelegramService } from "../../Services/TelegramService/TelegramService"
import { BotContext } from "../../Types/BotContext"

export class CallbackHandler {
	private usersService: UsersService
	private telegramService: TelegramService

	constructor(usersService: UsersService, telegramService: TelegramService) {
		this.usersService = usersService
		this.telegramService = telegramService
	}

	async handleGiveAppCreds(context: BotContext) {
		if (!context.from) {
			return
		}

		context.session.authStep = "app_id"

		await context
			.reply(Localized.add_app_id_message(context.from.id), {
				parse_mode: "Markdown"
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}

	async handleGiveAuthCreds(context: BotContext) {}

	async handleAddApiId(context: BotContext) {
		if (!context.from || !context.message?.text) {
			return
		}

		await this.usersService
			.saveApiId(context.from.id, parseInt(context.message?.text))
			.then(async (result) => {
				if (!context.from) {
					return
				}

				context.session.authStep = "app_hash"

				await context
					.reply(Localized.add_app_hash_message(context.from.id), {
						parse_mode: "Markdown"
					})
					.catch((error) => CoreErrorHandler.handle(error))

				return result
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}

	async handleAuthorize(context: BotContext) {
		await this.telegramService.authorize(context)
	}

	async handleAppHash(context: BotContext) {
		if (!context.from || !context.message?.text) {
			return
		}

		await this.usersService
			.saveApiHash(context.from.id, context.message.text)
			.then(async () => {
				await this.telegramService.authorize(context)
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}
}
