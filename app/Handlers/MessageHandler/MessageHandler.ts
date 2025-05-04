import { Context } from "grammy"
import { Localized } from "../../Resources/Localizations/Localized"
import { Message } from "grammy/types"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"

/**
 * Handler for messages to bot
 */
export class MessageHandler {

	/**
	 *	Handle common message
	 * @param context	Telegram context
	 */
	async handleMessage(context: Context) {
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

		await this.handleCommonMessage(context)
	}

	private async handleCommonMessage(context: Context) {
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

	private async deleteLoadingMessage(
		context: Context, 
		message: Message.TextMessage | undefined
	) {
		if (!message) {
			return
		}

		await context.api
			.deleteMessage(message.chat.id, message.message_id)
			.catch((error) => CoreErrorHandler.handle(error))
	}

	private async handleUnsupportedMessage(context: Context) {
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
