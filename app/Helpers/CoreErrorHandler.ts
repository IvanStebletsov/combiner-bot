import { CallbackQuery } from "../Handlers/CallbackHandler/CallbackQuery"
import { Localized } from "../Resources/Localizations/Localized"
import { BotContext } from "../Types/BotContext"
import { BaseError } from "../Types/Errors/BaseError"
import { TelegramServiceError } from "../Types/Errors/TelegramServiceError"
import { CoreLogger } from "./CoreLogger/CoreLogger"
import { InlineKeyboardBuilder } from "./InlineKeyboardBuilder"

/**
 * Handler for errors
 */
export class CoreErrorHandler {
	static async handle(error: any, context?: BotContext) {
		CoreLogger.log([{ text: "[ERROR]:", fg: "bright_white", bg: "bright_red" }, { text: ` ${error}` }])

		if (context) {
			if (error instanceof TelegramServiceError) {
				if (error.code == "invalid_api_creds") {
					await this.handleInvalidApiCreds(context)
				} else if (error.code == "auth_key_duplicated") {
					await this.handleInvalidAuthKeyDuplicated(context)
				}
			}
		}
	}

	private static async handleInvalidApiCreds(context: BotContext) {
		if (!context.from) {
			return
		}

		context
			.reply(Localized.invalid_app_id_message(context.from?.id), {
				parse_mode: "Markdown",
				reply_markup: InlineKeyboardBuilder.makeKeyboard([
					[Localized.invalid_cred_positive_action(context.from.id), CallbackQuery.GiveAppCreds().query]
				])
			})
			.then((message) => {
				context.session.messageForDeletion.push(message.message_id)
			})
			.catch(async (error) => CoreErrorHandler.handle(error))
	}

	private static async handleInvalidAuthKeyDuplicated(context: BotContext) {
		if (!context.from) {
			return
		}

		context
			.reply(Localized.auth_key_duplicated_message(context.from?.id), {
				parse_mode: "Markdown"
			})
			.then((message) => {
				context.session.messageForDeletion.push(message.message_id)
			})
			.catch(async (error) => CoreErrorHandler.handle(error))
	}
}
