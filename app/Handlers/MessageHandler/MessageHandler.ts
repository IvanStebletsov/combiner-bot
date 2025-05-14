import { Message } from "grammy/types"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { Localized } from "../../Resources/Localizations/Localized"
import { CallbackHandler } from "../CallbackHandler/CallbackHandler"
import { BotContext } from "../../Types/BotContext"
import { CoreUtils } from "../../Helpers/CoreUtils"

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
			if (context.message?.sticker) {
				console.log(JSON.stringify(context.message.sticker, null, 4))
			}
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
				context.session.messageForDeletion.push(context.message.message_id)

				if (context.chat) {
					await context.api
						.sendSticker(context.chat?.id, "CAACAgIAAxkBAAIEaWgk5w0dxpHW_Y3o3YChLV0rCuU2AAJJAgACVp29CiqXDJ0IUyEONgQ")
						.then(async (message) => {
							if (!context.from || !context.message?.text) {
								return
							}

							context.session.messageForDeletion.push(message.message_id)

							await CoreUtils.sleep(2000)

							await CoreUtils.deleteMessagesForDeletion(context)

							if (session.resolvePhone) {
								session.resolvePhone(text) // Передаем номер
								session.authStep = undefined
							}
						})
				}
				break
			case "code":
				context.session.messageForDeletion.push(context.message.message_id)

				if (context.chat) {
					await context.api
						.sendSticker(context.chat?.id, "CAACAgIAAxkBAAIEaWgk5w0dxpHW_Y3o3YChLV0rCuU2AAJJAgACVp29CiqXDJ0IUyEONgQ")
						.then(async (message) => {
							if (!context.from || !context.message?.text) {
								return
							}

							context.session.messageForDeletion.push(message.message_id)

							await CoreUtils.sleep(2000)

							await CoreUtils.deleteMessagesForDeletion(context)

							if (session.resolveCode) {
								session.resolveCode(text) // Передаем код
								session.authStep = undefined
							}
						})
				}
				break
			case "password":
				context.session.messageForDeletion.push(context.message.message_id)

				if (context.chat) {
					await context.api
						.sendSticker(context.chat?.id, "CAACAgIAAxkBAAIEaWgk5w0dxpHW_Y3o3YChLV0rCuU2AAJJAgACVp29CiqXDJ0IUyEONgQ")
						.then(async (message) => {
							if (!context.from || !context.message?.text) {
								return
							}

							context.session.messageForDeletion.push(message.message_id)

							await CoreUtils.sleep(2000)

							await CoreUtils.deleteMessagesForDeletion(context)

							if (session.resolvePassword) {
								session.resolvePassword(text) // Передаем пароль
								session.authStep = undefined
							}
						})
				}
				break
			default:
				break
		}
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
