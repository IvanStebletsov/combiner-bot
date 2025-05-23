import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { Localized } from "../../Resources/Localizations/Localized"
import { UsersService } from "../../Services/UserService/UserService"
import { TelegramService } from "../../Services/TelegramService/TelegramService"
import { BotContext } from "../../Types/BotContext"
import { CoreUtils } from "../../Helpers/CoreUtils"
import { UserServiceError } from "../../Types/Errors/UserServiceError"
import { TelegramServiceError } from "../../Types/Errors/TelegramServiceError"

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

		await CoreUtils.deleteMessagesForDeletion(context)

		await context
			.reply(Localized.add_app_id_message(context.from.id), {
				parse_mode: "Markdown"
			})
			.then((message) => {
				context.session.messageForDeletion.push(message.message_id)
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}

	async handleGiveAuthCreds(context: BotContext) {
		await CoreUtils.deleteMessagesForDeletion(context)
		await this.handleAuthorize(context)
	}

	async handleAddApiId(context: BotContext) {
		if (!context.from || !context.message?.text) {
			return
		}

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

					await this.usersService
						.saveApiId(context.from.id, parseInt(context.message.text))
						.then(async (result) => {
							if (!context.from) {
								return
							}

							await CoreUtils.deleteMessagesForDeletion(context)

							context.session.authStep = "app_hash"

							await context
								.reply(Localized.add_app_hash_message(context.from.id), {
									parse_mode: "Markdown"
								})
								.then((message) => {
									context.session.messageForDeletion.push(message.message_id)
								})
								.catch((error) => CoreErrorHandler.handle(error))

							return result
						})
						.catch((error) => CoreErrorHandler.handle(error))
				})
				.catch((error) => CoreErrorHandler.handle(error))
		}
	}

	async handleAppHash(context: BotContext) {
		if (!context.from || !context.message?.text) {
			return
		}

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

					await this.usersService
						.saveApiHash(context.from.id, context.message.text)
						.then(async () => {
							await CoreUtils.deleteMessagesForDeletion(context)
							await this.handleAuthorize(context)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				})
		}
	}

	async handleAuthorize(context: BotContext) {
		await this.telegramService
			.authorize(context)
			.then((session) => {
				if (!session) {
					return
				}

				context
					.replyWithSticker("CAACAgIAAxkBAAIFe2glCxRCHeM4iYfjCDTcIrmd4D2HAAL3AANWnb0KC3IkHUj0DTA2BA")
					.then(() => {
						if (!context.from) {
							return
						}

						context
							.reply(Localized.authorization_complete_message(context.from.id))
							.catch((error) => CoreErrorHandler.handle(error))
					})
					.catch((error) => CoreErrorHandler.handle(error))
			})
			.catch(async (error) => {
				await CoreUtils.deleteMessagesForDeletion(context)
				CoreErrorHandler.handle(error)

				if (!context.from) {
					return
				}

				if (error instanceof UserServiceError) {
					if (error.code == "fetching_api_id" || error.code == "fetching_api_hash") {
						await this.handleGiveAppCreds(context)
					}
				} else if (error instanceof TelegramServiceError) {
					if (error.code == "client_creation") {
						await this.handleGiveAppCreds(context)
					} else if (error.code == "invalid_api_creds") {
						CoreErrorHandler.handle(error, context)
					}
				}
			})
	}

	async handleDeleteMessage(context: BotContext) {
		if (context.callbackQuery?.data) {
			const callbackQuery = CoreUtils.callbackQueryToUrl(context.callbackQuery.data)

			if ((callbackQuery.searchParams.get("mid"), context.chat?.id)) {
				const mid = Number(callbackQuery.searchParams.get("mid"))

				await context.api.deleteMessage(context.chat.id, mid).catch((error) => CoreErrorHandler.handle(error))
			}
		}
	}

	async handleMarkAsRead(context: BotContext) {
		if (context.callbackQuery?.data) {
			const callbackQuery = CoreUtils.callbackQueryToUrl(context.callbackQuery.data)

			if ((callbackQuery.searchParams.get("cid"), context.chat?.id)) {
				const cid = Number(callbackQuery.searchParams.get("cid"))
				const mid = Number(callbackQuery.searchParams.get("mid"))

				await this.telegramService
					.markChatAsRead(context, cid)
					.then(async () => {
						console.log(context.chat?.id, mid)
						if (!context.from || !context.chat || !mid) {
							return
						}

						await context.api
							.editMessageReplyMarkup(context.chat.id, mid, {
								reply_markup: undefined
							})
							.catch(async (error) => CoreErrorHandler.handle(error, context))
					})
					.catch((error) => CoreErrorHandler.handle(error, context))
			}
		}
	}
}
