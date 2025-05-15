import { Message, ParseMode, User } from "grammy/types"
import { CoreUtils } from "../../Helpers/CoreUtils"
import { BotContext } from "../../Types/BotContext"
import { CallbackQuery } from "../CallbackHandler/CallbackQuery"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { Localized } from "../../Resources/Localizations/Localized"
import { UsersService } from "../../Services/UserService/UserService"
import { InlineKeyboardBuilder } from "../../Helpers/InlineKeyboardBuilder"
import { TelegramService } from "../../Services/TelegramService/TelegramService"
import { CallSource } from "../../Types/CallSource"
import { GPTService } from "../../Services/GPTService/GPTService"
import { CoreLogger } from "../../Helpers/CoreLogger/CoreLogger"
import { TelegramServiceError } from "../../Types/Errors/TelegramServiceError"
import { CallbackHandler } from "../CallbackHandler/CallbackHandler"
import { UserServiceError } from "../../Types/Errors/UserServiceError"
import { State } from "../../Helpers/State"

export class CommandHandler {
	private usersService: UsersService
	private telegramService: TelegramService
	private callbackHandler: CallbackHandler
	private gptService: GPTService
	private state: State

	constructor(
		usersService: UsersService,
		telegramService: TelegramService,
		callbackHandler: CallbackHandler,
		gptService: GPTService,
		state: State
	) {
		this.usersService = usersService
		this.telegramService = telegramService
		this.callbackHandler = callbackHandler
		this.gptService = gptService
		this.state = state
	}

	async handleStart(context: BotContext) {
		if (!context.from) {
			return
		}

		this.saveUserIfNeeded(context.from)

		await CoreUtils.deleteMessagesForDeletion(context)

		await context
			.reply(Localized.welcome_message_initial(context.from.id), {
				parse_mode: "Markdown"
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}

	async handleListOfFolders(context: BotContext) {
		const loadingMessage = await this.sendLoadingMessage(context)

		await CoreUtils.deleteMessagesForDeletion(context)

		await this.telegramService
			.getFolders(context)
			.then(async (folders) => {
				var page = 0

				if (context.callbackQuery?.data) {
					const callbackQuery = CoreUtils.callbackQueryToUrl(context.callbackQuery.data)

					if (callbackQuery.searchParams.get("pg")) {
						page = Number(callbackQuery.searchParams.get("pg"))
					}
				}

				const pages = CoreUtils.chunked(folders, 10)

				const buttons: Array<Array<[string, string]>> = []

				if (pages.length > 0) {
					for (const folder of pages[page]) {
						if (folder.title) {
							buttons.push([[folder.title, CallbackQuery.ListOfChats(undefined, undefined, folder.id, page).query]])
						}
					}
				}

				if (pages.length > 1) {
					const arrows: Array<[string, string]> = []

					if (page > 0) {
						arrows.push(["◀️", CallbackQuery.ListOfFolders(page - 1).query])
					}

					arrows.push([`${page + 1} / ${pages.length}`, CallbackQuery.DoNothing().query])

					if (page < pages.length - 1) {
						arrows.push(["▶️", CallbackQuery.ListOfFolders(page + 1).query])
					}

					buttons.push(arrows)
				}

				if (!context.from) {
					return
				}

				await this.deleteLoadingMessage(context, loadingMessage)

				if (context.callbackQuery?.data) {
					if (context.message?.message_id) {
						buttons.push([
							[Localized.close_action(context.from.id), CallbackQuery.DeleteMessage(context.message.message_id).query]
						])
					}

					context
						.editMessageText(Localized.list_of_folders_message(context.from.id), {
							reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
						})
						.then(async (message) => {
							if (!context.from || !context.chat) {
								return
							}

							await this.addButtons(
								context,
								context.chat.id,
								message["message_id"],
								Localized.list_of_folders_message(context.from.id),
								undefined,
								buttons,
								undefined
							)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				} else {
					context
						.reply(Localized.list_of_folders_message(context.from.id), {
							reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
						})
						.then(async (message) => {
							if (!context.from || !context.chat) {
								return
							}

							await this.addButtons(
								context,
								context.chat.id,
								message.message_id,
								Localized.list_of_folders_message(context.from.id),
								undefined,
								buttons,
								undefined
							)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				}
			})
			.catch(async (error) => {
				CoreErrorHandler.handle(error)
				await this.deleteLoadingMessage(context, loadingMessage)

				if (error instanceof UserServiceError) {
					if (error.code == "fetching_api_id" || error.code == "fetching_api_hash") {
						await this.telegramService.handleUnauthorizedUser(context)
					}
				} else if (error instanceof TelegramServiceError) {
					if (error.code == "client_creation") {
						await this.telegramService.handleUnauthorizedUser(context)
					}
				}
			})
	}

	async handleListOfAllUnreadedChats(context: BotContext) {
		await CoreUtils.deleteMessagesForDeletion(context)
		await this.handleListOfChats(context, true)
	}

	async handleListOfChats(context: BotContext, allUnread?: boolean) {
		if (!context.from) {
			return
		}

		var folderId: number | undefined
		var allUnread = allUnread

		if (context.callbackQuery?.data) {
			const callbackQuery = CoreUtils.callbackQueryToUrl(context.callbackQuery.data)

			if (callbackQuery.searchParams.get("fd_id")) {
				folderId = Number(callbackQuery.searchParams.get("fd_id"))
			}

			if (callbackQuery.searchParams.get("a_urnd")) {
				allUnread = Boolean(callbackQuery.searchParams.get("a_urnd"))
			}
		}

		const loadingMessage = await this.sendLoadingMessage(context)

		await this.telegramService
			.getChats(context, allUnread, folderId)
			.then(async (unreadChats) => {
				if (!context.from) {
					return
				}

				var page = 0
				var foldersPage: number | undefined

				if (context.callbackQuery?.data) {
					const callbackQuery = CoreUtils.callbackQueryToUrl(context.callbackQuery.data)

					if (callbackQuery.searchParams.get("pg")) {
						page = Number(callbackQuery.searchParams.get("pg"))
					}

					if (callbackQuery.searchParams.get("fd_pg")) {
						foldersPage = Number(callbackQuery.searchParams.get("fd_pg"))
					}
				}

				const pages = CoreUtils.chunked(unreadChats, 10)

				const buttons: Array<Array<[string, string]>> = []

				if (pages.length > 0) {
					for (const chat of pages[page]) {
						if (chat.title) {
							buttons.push([[chat.title, CallbackQuery.ReadUnreadChatMessages(Number(chat.id)).query]])
						}
					}
				}

				if (pages.length > 1) {
					const arrows: Array<[string, string]> = []

					if (page > 0) {
						arrows.push(["◀️", CallbackQuery.ListOfChats(allUnread, page - 1, folderId, foldersPage).query])
					}

					arrows.push([`${page + 1} / ${pages.length}`, CallbackQuery.DoNothing().query])

					if (page < pages.length - 1) {
						arrows.push(["▶️", CallbackQuery.ListOfChats(allUnread, page + 1, folderId, foldersPage).query])
					}

					buttons.push(arrows)
				}

				await this.deleteLoadingMessage(context, loadingMessage)

				if (context.callbackQuery?.data) {
					context
						.editMessageText(Localized.list_of_chats_message(context.from.id), {
							reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
						})
						.then(async (message) => {
							if (!context.from || !context.chat) {
								return
							}

							await this.addButtons(
								context,
								context.chat.id,
								message["message_id"],
								Localized.list_of_chats_message(context.from.id),
								foldersPage,
								buttons,
								undefined
							)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				} else {
					context
						.reply(Localized.list_of_chats_message(context.from.id), {
							reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
						})
						.then(async (message) => {
							if (!context.from || !context.chat) {
								return
							}

							await this.addButtons(
								context,
								context.chat.id,
								message.message_id,
								Localized.list_of_chats_message(context.from.id),
								foldersPage,
								buttons,
								undefined
							)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				}
			})
			.catch(async (error) => {
				CoreErrorHandler.handle(error)

				if (error instanceof TelegramServiceError) {
					if (error.code == "client_creation") {
						await this.telegramService.handleUnauthorizedUser(context)
					} else if ((error.code == "no_chats_in_folder", context.from)) {
						context.reply(Localized.no_chats(context.from.id)).catch((error) => CoreErrorHandler.handle(error))
					}
				} else if (error instanceof UserServiceError) {
					if (error.code == "fetching_api_id" || error.code == "fetching_api_hash") {
						await this.telegramService.handleUnauthorizedUser(context)
					}
				}

				await this.deleteLoadingMessage(context, loadingMessage)
			})
	}

	async handleReadUnreadChatMessages(context: BotContext) {
		if (!context.from) {
			return
		}

		var chatId: number | undefined

		if (context.callbackQuery?.data) {
			const callbackQuery = CoreUtils.callbackQueryToUrl(context.callbackQuery.data)

			if (callbackQuery.searchParams.get("cid")) {
				chatId = Number(callbackQuery.searchParams.get("cid"))
			}
		}

		if (!chatId) {
			return
		}

		const loadingMessage = await this.sendLoadingMessage(context)

		await this.telegramService
			.getUnreadMessages(context, chatId)
			.then(async (unreadMessages) => {
				if (unreadMessages == "[]" && context.from) {
					await context
						.reply(Localized.no_unread_messages(context.from.id), {
							parse_mode: "HTML"
						})
						.catch(async (error) => {
							CoreErrorHandler.handle(error)

							await this.deleteLoadingMessage(context, loadingMessage)
						})
				}

				var responseParts = await this.gptService.analize(unreadMessages)

				if (responseParts.length == 1) {
					responseParts = CoreUtils.splitByDoubleNewline(responseParts[0])
				}

				await this.deleteLoadingMessage(context, loadingMessage)

				for (const part of responseParts) {
					await context
						.reply(part, {
							parse_mode: "HTML"
						})
						.catch(async (error) => CoreErrorHandler.handle(error))
				}
			})
			.catch(async (error) => {
				CoreErrorHandler.handle(error)

				await this.deleteLoadingMessage(context, loadingMessage)
			})
	}

	async handleHowToGrantAccess(context: BotContext) {
		if (!context.from) {
			return
		}

		await CoreUtils.deleteMessagesForDeletion(context)

		await context.reply(Localized.how_to_grant_access_message(context.from.id), {
			parse_mode: "MarkdownV2",
			reply_markup: InlineKeyboardBuilder.makeKeyboard([
				[Localized.give_ids(context.from?.id), CallbackQuery.GiveAppCreds().query]
			])
		})
	}

	async handleClearIds(context: BotContext) {
		if (!context.from) {
			return
		}

		await CoreUtils.deleteMessagesForDeletion(context)
		await this.usersService
			.clearUserIds(context.from.id)
			.then(async () => {
				if (!context.from) {
					return
				}

				this.state.deleteTelegramClient(context.from.id)

				const buttons: Array<Array<[string, string]>> = []

				await context
					.reply(Localized.user_ids_have_been_cleared(context.from.id), {
						parse_mode: "Markdown",
						reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
					})
					.then(async (message) => {
						if (!context.from || !context.chat) {
							return
						}

						await this.addButtons(
							context,
							context.chat.id,
							message.message_id,
							Localized.user_ids_have_been_cleared(context.from.id),
							undefined,
							buttons,
							"Markdown"
						)
					})
					.catch((error) => CoreErrorHandler.handle(error))
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}

	private async addButtons(
		context: BotContext,
		chatId: number,
		messageId: number,
		text: string,
		foldersPage: number | undefined,
		buttons: Array<Array<[string, string]>>,
		parseMode: ParseMode | undefined
	) {
		if (!context.from) {
			return
		}

		const closeButtons: Array<[string, string]> = []

		if (CoreUtils.isNotEmpty(foldersPage)) {
			closeButtons.push([Localized.back_action(context.from?.id), CallbackQuery.ListOfFolders(foldersPage).query])
		}

		closeButtons.push([Localized.close_action(context.from.id), CallbackQuery.DeleteMessage(messageId).query])

		buttons.push(closeButtons)

		await context.api
			.editMessageText(chatId, messageId, text, {
				parse_mode: parseMode,
				reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}

	private async sendLoadingMessage(context: BotContext): Promise<Message.TextMessage> {
		if (!context.from) {
			return Promise.reject(new TelegramServiceError("no_user_id"))
		}

		var loadingMessage: Message.TextMessage | undefined

		try {
			loadingMessage = await context.reply(Localized.loading_message(context.from.id), {
				disable_notification: true
			})

			return Promise.resolve(loadingMessage!)
		} catch (error) {
			if (loadingMessage) {
				await context.api
					.deleteMessage(loadingMessage.chat.id, loadingMessage.message_id)
					.catch((error) => CoreErrorHandler.handle(error))
			}

			CoreErrorHandler.handle(error)

			return Promise.reject(new TelegramServiceError("something_went_wrong"))
		}
	}

	private async saveUserIfNeeded(user: User | undefined) {
		if (!user) {
			CoreErrorHandler.handle("User is undefined")
			return
		}

		if (!process.env.PROJECT_NAME) {
			CoreErrorHandler.handle("PROJECT_NAME is undefined")
			return
		}

		return this.usersService
			.saveUser(
				user.id,
				user.first_name,
				user.last_name,
				user.username,
				user.language_code ?? "ru",
				process.env.PROJECT_NAME
			)
			.catch((error) => CoreErrorHandler.handle(error))
	}

	private async deleteLoadingMessage(context: BotContext, message: Message.TextMessage | undefined) {
		if (!message) {
			return
		}

		await context.api
			.deleteMessage(message.chat.id, message.message_id)
			.catch((error) => CoreErrorHandler.handle(error))
	}
}
