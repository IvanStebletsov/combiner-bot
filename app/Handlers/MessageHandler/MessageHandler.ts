import { Message } from "grammy/types"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { Localized } from "../../Resources/Localizations/Localized"
import { CallbackHandler } from "../CallbackHandler/CallbackHandler"
import { BotContext } from "../../Types/BotContext"

/**
 * Handler for messages to bot
 */
export class MessageHandler {
	private callbackHandler: CallbackHandler

	constructor(callbackHandler: CallbackHandler) {
		this.callbackHandler = callbackHandler
	}

	/**
	 *	Handle common message
	 * @param context	Telegram context
	 */
	async handleMessage(context: BotContext) {
		if (
			context.message?.voice ||
			context.message?.sticker ||
			context.message?.location ||
			context.message?.photo ||
			context.message?.poll ||
			context.message?.document ||
			context.message?.video ||
			context.message?.contact
		) {
			if (context.message.chat.type == "private") {
				return this.handleUnsupportedMessage(context)
			}
		}

		if (!context.message?.text) {
			return
		}

		const text = context.message.text
		const session = context.session

		switch (session.authStep) {
			case "app_id":
				this.callbackHandler.handleAddApiId(context)
				session.authStep = undefined
				break
			case "app_hash":
				this.callbackHandler.handleAppHash(context)
				session.authStep = undefined
				break
			case "phone":
				if (session.resolvePhone) {
					session.resolvePhone(text) // Передаем номер
					session.authStep = undefined
				}
				break
			case "code":
				if (session.resolveCode) {
					session.resolveCode(text) // Передаем код
					session.authStep = undefined
				}
				break
			case "password":
				if (session.resolvePassword) {
					session.resolvePassword(text) // Передаем пароль
					session.authStep = undefined
				}
				break
			default:
				break
		}
	}

	private async handleCommonMessage(context: BotContext) {
		if (!context.from || !context.chat || !context.message || !context.message?.text) {
			return
		}

		// Store sent loading message here to be able delete it
		var loadingMessage: Message.TextMessage | undefined

		try {
			// Show loading message ⏳ and store it in variable
			loadingMessage = await context.reply(Localized.loading_message(context.from.id), {
				disable_notification: true
			})
		} catch (error) {
			if (loadingMessage) {
				context.api
					.deleteMessage(loadingMessage.chat.id, loadingMessage.message_id)
					.catch((error) => CoreErrorHandler.handle(error))
			}

			CoreErrorHandler.handle(error)
		}
	}

	private async deleteLoadingMessage(context: BotContext, message: Message.TextMessage | undefined) {
		if (!message) {
			return
		}

		await context.api
			.deleteMessage(message.chat.id, message.message_id)
			.catch((error) => CoreErrorHandler.handle(error))
	}

	private async handleUnsupportedMessage(context: BotContext) {
		if (!context.from) {
			return
		}

		return context
			.reply(Localized.unsupported_message_type(context.from.id), {
				disable_notification: true
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}
}
