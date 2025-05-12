import { User } from "grammy/types"
import { CoreUtils } from "../../Helpers/CoreUtils"
import { BotContext } from "../../Types/BotContext"
import { CallbackQuery } from "../CallbackHandler/CallbackQuery"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { Localized } from "../../Resources/Localizations/Localized"
import { UsersService } from "../../Services/UserService/UserService"
import { InlineKeyboardBuilder } from "../../Helpers/InlineKeyboardBuilder"
import { TelegramService } from "../../Services/TelegramService/TelegramService"
import { TelegramServiceError } from "../../Types/Errors/TelegramServiceError"
import { CallSource } from "../../Types/CallSource"

export class CommandHandler {
	private usersService: UsersService
	private telegramService: TelegramService

	constructor(usersService: UsersService, telegramService: TelegramService) {
		this.usersService = usersService
		this.telegramService = telegramService
	}

	async handleStart(context: BotContext) {
		if (!context.from) {
			return
		}

		this.saveUserIfNeeded(context.from)

		await CoreUtils.replayWithChunks(Localized.welcome_message_initial(context.from.id), context, undefined, "Markdown")
	}

	async handleListOfFolders(context: BotContext) {
		await this.telegramService
			.getFolders(context)
			.then((folders) => {
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
					for (const chat of pages[page]) {
						if (chat.title) {
							buttons.push([[chat.title, CallbackQuery.ListOfChats("list_of_folders", undefined, chat.id, page).query]])
						}
					}
				}

				if (pages.length > 1) {
					const arrows: Array<[string, string]> = []

					if (page > 0) {
						arrows.push(["◀️", CallbackQuery.ListOfFolders("list_of_folders", page - 1).query])
					}

					arrows.push([`${page + 1} / ${pages.length}`, CallbackQuery.DoNothing("list_of_folders").query])

					if (page < pages.length - 1) {
						arrows.push(["▶️", CallbackQuery.ListOfFolders("list_of_folders", page + 1).query])
					}

					buttons.push(arrows)
				}

				if (!context.from) {
					return
				}

				if (context.callbackQuery?.data) {
					context
						.editMessageText(Localized.list_of_folders_message(context.from.id), {
							reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				} else {
					context
						.reply(Localized.list_of_folders_message(context.from.id), {
							reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				}
			})
			.catch(async (error) => {
				CoreErrorHandler.handle(error)

				if (!context.from) {
					return
				}

				if (error instanceof TelegramServiceError) {
					await context
						.reply(Localized.unauthorized_message("", context.from.id), {
							parse_mode: "Markdown",
							reply_markup: InlineKeyboardBuilder.makeKeyboard([
								[
									Localized.how_to_grant_access_message_action(context.from?.id),
									CallbackQuery.HowToGrantAccess("list_of_all_unreaded_chats").query
								]
							])
						})
						.catch((error) => CoreErrorHandler.handle(error))
				}
			})
	}

	async handleListOfAllUnreadedChats(context: BotContext) {
		await this.handleListOfChats(context, "list_of_all_unreaded_chats", true)
	}

	async handleListOfChats(context: BotContext, from: CallSource = "list_of_chats", allUnread?: boolean) {
		if (!context.from) {
			return
		}
		var folder: number | undefined

		if (context.callbackQuery?.data) {
			const callbackQuery = CoreUtils.callbackQueryToUrl(context.callbackQuery.data)

			if (callbackQuery.searchParams.get("fd")) {
				folder = Number(callbackQuery.searchParams.get("fd"))
			}
		}

		await this.telegramService
			.getChats(context, allUnread, folder)
			.then((unreadChats) => {
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
							buttons.push([[chat.title, CallbackQuery.GiveAuthCreds(from).query]])
						}
					}
				}

				if (pages.length > 1) {
					const arrows: Array<[string, string]> = []

					if (page > 0) {
						arrows.push(["◀️", CallbackQuery.ListOfChats(from, page - 1, folder, foldersPage).query])
					}

					arrows.push([`${page + 1} / ${pages.length}`, CallbackQuery.DoNothing(from).query])

					if (page < pages.length - 1) {
						arrows.push(["▶️", CallbackQuery.ListOfChats(from, page + 1, folder, foldersPage).query])
					}

					buttons.push(arrows)
				}

				if (CoreUtils.isNotEmpty(foldersPage)) {
					buttons.push([
						[Localized.back_action(context.from?.id), CallbackQuery.ListOfFolders(from, foldersPage).query]
					])
				}

				console.log("[FOLDER PAGE]: ", foldersPage, buttons)

				if (context.callbackQuery?.data) {
					context
						.editMessageText(Localized.list_of_chats_message(context.from.id), {
							reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				} else {
					context
						.reply(Localized.list_of_chats_message(context.from.id), {
							reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
						})
						.catch((error) => CoreErrorHandler.handle(error))
				}
			})
			.catch(async (error) => {
				CoreErrorHandler.handle(error)

				if (!context.from) {
					return
				}

				if (error instanceof TelegramServiceError) {
					await context
						.reply(Localized.unauthorized_message("", context.from.id), {
							parse_mode: "Markdown",
							reply_markup: InlineKeyboardBuilder.makeKeyboard([
								[
									Localized.how_to_grant_access_message_action(context.from?.id),
									CallbackQuery.HowToGrantAccess(from).query
								]
							])
						})
						.catch((error) => CoreErrorHandler.handle(error))
				}
			})
	}

	async handleHowToGrantAccess(context: BotContext) {
		if (!context.from) {
			return
		}

		await context.reply(Localized.how_to_grant_access_message(context.from.id), {
			parse_mode: "MarkdownV2",
			reply_markup: InlineKeyboardBuilder.makeKeyboard([
				[Localized.give_ids(context.from?.id), CallbackQuery.GiveAppCreds("how_to_grant_access").query]
			])
		})
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
}
