import { Api, TelegramClient } from "telegram"
import { Session, StringSession } from "telegram/sessions"
import { State } from "../../Helpers/State"
import { BotContext } from "../../Types/BotContext"
import { UsersService } from "../UserService/UserService"
import { Localized } from "../../Resources/Localizations/Localized"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { CoreLogger } from "../../Helpers/CoreLogger/CoreLogger"
import { Dialog } from "telegram/tl/custom/dialog"
import { InlineKeyboardBuilder } from "../../Helpers/InlineKeyboardBuilder"
import { CallbackQuery } from "../../Handlers/CallbackHandler/CallbackQuery"
import { TelegramServiceError } from "../../Types/Errors/TelegramServiceError"
import { TelegramFolder } from "../../Types/TelegramFolder"
import { Message } from "../../Models/Message"
import { CoreUtils } from "../../Helpers/CoreUtils"

export class TelegramService {
	private CURRENT_VERSION = "1"
	private usersService: UsersService
	private state: State

	constructor(usersService: UsersService, state: State) {
		this.usersService = usersService
		this.state = state
	}

	async authorize(context: BotContext): Promise<string | Session | undefined> {
		if (!context.from) {
			return Promise.reject(new TelegramServiceError("no_user_id"))
		}

		const client = await this.getClient(context.from.id).catch((error) => {
			return Promise.reject(error)
		})

		await client.start({
			phoneNumber: async () => await this.requestPhone(context),
			password: async () => await this.requestPassword(context),
			phoneCode: async () => await this.requestCode(context),
			onError: (error) => CoreErrorHandler.handle(error)
		})

		const session = client.session

		const key = session.authKey?.getKey()

		if (!key) {
			return
		}

		const dcBuffer = Buffer.from([session.dcId])
		const addressBuffer = Buffer.from(session.serverAddress)
		const addressLengthBuffer = Buffer.alloc(2)
		addressLengthBuffer.writeInt16BE(addressBuffer.length, 0)
		const portBuffer = Buffer.alloc(2)
		portBuffer.writeInt16BE(session.port, 0)

		const stringSession = StringSession.encode(
			Buffer.concat([dcBuffer, addressLengthBuffer, addressBuffer, portBuffer, key])
		)

		await this.usersService.saveSession(context.from.id, stringSession)

		return Promise.resolve(stringSession)
	}

	async getFolders(context: BotContext): Promise<TelegramFolder[]> {
		if (!context.from) {
			return Promise.reject(new TelegramServiceError("no_user_id"))
		}

		const client = await this.getClient(context.from.id).catch((error) => {
			return Promise.reject(error)
		})

		if (!client.connected) {
			await client.connect()
		}

		const isAuthorized = await client.checkAuthorization()
		CoreLogger.log([{ text: `[IS AUTHORIZED]: ${isAuthorized}`, fg: "green" }])

		if (isAuthorized) {
			const dialogFilters = await client.invoke(new Api.messages.GetDialogFilters())
			const folders = dialogFilters.filters.map((filter) => {
				return new TelegramFolder(filter)
			})

			return Promise.resolve(folders)
		} else {
			return await this.handleUnauthorizedUser(context)
		}
	}

	async getChats(context: BotContext, allUnread?: boolean, folderId?: number): Promise<Dialog[]> {
		if (!context.from) {
			return Promise.reject(new TelegramServiceError("no_user_id"))
		}

		const client = await this.getClient(context.from.id).catch((error) => {
			return Promise.reject(error)
		})

		if (!client.connected) {
			await client.connect()
		}

		const isAuthorized = await client.checkAuthorization()

		CoreLogger.log([{ text: `[IS AUTHORIZED]: ${isAuthorized}`, fg: "green" }])
		CoreLogger.log([{ text: `[FOLDER ID]: ${folderId}`, fg: "green" }])

		if (isAuthorized) {
			var chatIds: number[] = []

			const folders = await this.getFolders(context)

			if (folderId) {
				const folder = folders.find((item) => item.id == folderId)
				chatIds = folder?.chats.map((chat) => chat.chatId ?? chat.userId ?? chat.channelId) ?? []

				if (folder?.includeGroups == false && chatIds.length == 0) {
					return Promise.reject(new TelegramServiceError("no_chats_in_folder"))
				}
			}

			const chats = await client.getDialogs()

			if (folderId) {
				const folder = folders.find((item) => item.id == folderId)

				if (folder && folder.includeGroups) {
					chatIds = chats
						.filter((chat) => chat.isChannel || chat.isGroup)
						.map((chat) => Number(`${chat.id}`.replace("-100", "")))
				}

				if (chatIds.length == 0) {
					return Promise.reject(new TelegramServiceError("no_chats_in_folder"))
				}
			}

			const unreadChats = chats
				.filter((chat) => (allUnread == true ? chat.unreadCount > 0 : true))
				.filter((chat) => (chatIds.length > 0 ? chatIds.includes(Number(`${chat.id}`.replace("-100", ""))) : true))
				.sort((lhs, rhs) => {
					if (lhs.pinned != rhs.pinned) {
						return Number(rhs.pinned) - Number(lhs.pinned)
					} else {
						return rhs.date - lhs.date
					}
				})

			for (const dialog of unreadChats) {
				var id: number | undefined

				if (dialog.inputEntity instanceof Api.InputPeerChannel) {
					id = Number(dialog.inputEntity.channelId)
				} else if (dialog.inputEntity instanceof Api.InputPeerUser) {
					id = Number(dialog.inputEntity.userId)
				}

				CoreLogger.log([{ text: `[DIALOG]: ${dialog.title} - ${dialog.unreadCount} (${id})`, fg: "green" }])
			}

			return Promise.resolve(unreadChats)
		} else {
			return await this.handleUnauthorizedUser(context)
		}
	}

	async getUnreadMessages(context: BotContext, chatId: number): Promise<string> {
		if (!context.from) {
			return Promise.reject(new TelegramServiceError("no_user_id"))
		}

		const client = await this.getClient(context.from.id).catch((error) => {
			return Promise.reject(error)
		})

		if (!client.connected) {
			await client.connect()
		}

		const isAuthorized = await client.checkAuthorization()
		CoreLogger.log([{ text: `[IS AUTHORIZED]: ${isAuthorized}`, fg: "green" }])

		if (isAuthorized) {
			const chats = await client.getDialogs()
			const exactChat = await client.getEntity(chatId)
			console.log("CHAT:", JSON.stringify(exactChat, null, 2))
			const chat = chats.find((chat) => Number(chat.id) == chatId)

			if (!chat) {
				return Promise.reject(new TelegramServiceError("no_chat_with_id"))
			}

			var unreadMessages: Array<Message> = []

			const unreadMessagesCount = chat.unreadCount > 0 ? Math.min(300, chat.unreadCount) : undefined

			CoreLogger.log([
				{ text: `[UNREAD MESSAGES]:`, fg: "green" },
				{ text: ` ${chat.unreadCount} (${unreadMessagesCount})` }
			])

			if (!unreadMessagesCount) {
				return Promise.resolve("[]")
			}

			const messages = await client.getMessages(chat.entity, { limit: unreadMessagesCount })

			for await (const message of messages) {
				if (!message.text) {
					continue
				}

				var username = ""

				if (message.fromId) {
					const entity = await client.getEntity(message.fromId)
					const firstName = entity["firstName"]
					const lastName = entity["lastName"]
					const nickName = entity["username"]

					if (firstName) {
						username += CoreUtils.escape(firstName)
					}

					if (lastName) {
						username += ` ${CoreUtils.escape(firstName)}`
					}

					if (nickName) {
						username += ` (@${CoreUtils.escape(firstName)})`
					}
				} else if (message.peerId instanceof Api.PeerChat) {
					const entity = await client.getEntity(message.peerId.chatId)

					if (entity["title"]) {
						username += CoreUtils.escape(entity["title"])
					}
				} else if (message.peerId instanceof Api.PeerChannel) {
					const entity = await client.getEntity(message.peerId.channelId)

					if (entity["title"]) {
						username += CoreUtils.escape(entity["title"])
					}
				}

				const date = new Date(message.date * 1000)
				const unreadMessage = new Message(username, message.date, date, message.text)
				unreadMessages.push(unreadMessage)
			}

			unreadMessages = unreadMessages.sort((lhs, rhs) => rhs.date.getTime() - lhs.date.getTime())
			const jsonUnreadMessages = JSON.stringify(unreadMessages)

			CoreLogger.log([{ text: `\n[MESSAGES]: ${JSON.stringify(unreadMessages, null, 4)}`, fg: "green" }])

			return Promise.resolve(jsonUnreadMessages)
		} else {
			return await this.handleUnauthorizedUser(context)
		}
	}

	async handleUnauthorizedUser(context: BotContext) {
		if (!context.from) {
			return Promise.reject(new TelegramServiceError("no_user_id"))
		}

		const apiId = await this.usersService.apiId(context.from.id)
		const apiHash = await this.usersService.apiHash(context.from.id)
		const details = apiId || apiHash ? Localized.unauthorized_message_details(context.from.id) : ""
		const buttons: Array<Array<[string, string]>> = []

		if (apiId || apiHash) {
			buttons.push([
				[Localized.unauthorized_positive_action(context.from?.id), CallbackQuery.GiveAuthCreds("h_t_gr_acc").query],
				[Localized.unauthorized_negative_action(context.from?.id), CallbackQuery.GiveAppCreds("h_t_gr_acc").query]
			])
		} else {
			buttons.push([[Localized.authorize_action(context.from?.id), CallbackQuery.Authorize("h_t_gr_acc").query]])
		}

		await context
			.reply(Localized.unauthorized_message(details, context.from.id), {
				parse_mode: "Markdown",
				reply_markup: InlineKeyboardBuilder.makeKeyboard(...buttons)
			})
			.then((message) => {
				context.session.messageForDeletion.push(message.message_id)
			})
			.catch((error) => CoreErrorHandler.handle(error))

		return Promise.reject(new TelegramServiceError("user_not_authorized"))
	}

	private async requestPhone(context: BotContext): Promise<string> {
		return new Promise((resolve) => {
			if (!context.from) {
				return Promise.reject(undefined)
			}

			context.session.authStep = "phone"
			context.session.resolvePhone = resolve
			context
				.reply(Localized.phone_number_request_message(context.from.id), {
					parse_mode: "Markdown"
				})
				.then((message) => {
					context.session.messageForDeletion.push(message.message_id)
				})
				.catch((error) => CoreErrorHandler.handle(error))
		})
	}

	private async requestCode(context: BotContext): Promise<string> {
		return new Promise((resolve) => {
			if (!context.from) {
				return Promise.reject(undefined)
			}

			context.session.authStep = "code"
			context.session.resolveCode = resolve
			context
				.reply(Localized.auth_code_request_message(context.from.id), {
					parse_mode: "Markdown"
				})
				.then((message) => {
					context.session.messageForDeletion.push(message.message_id)
				})
				.catch((error) => CoreErrorHandler.handle(error))
		})
	}

	private async requestPassword(context: BotContext): Promise<string> {
		return new Promise((resolve) => {
			if (!context.from) {
				return Promise.reject(new TelegramServiceError("no_user_id"))
			}

			context.session.authStep = "password"
			context.session.resolvePassword = resolve
			context
				.reply(Localized.two_fa_password_request_message(context.from.id), {
					parse_mode: "Markdown"
				})
				.then((message) => {
					context.session.messageForDeletion.push(message.message_id)
				})
				.catch((error) => CoreErrorHandler.handle(error))
		})
	}

	private async getClient(userId: number): Promise<TelegramClient> {
		if (this.state.getTelegramClient(userId)) {
			return Promise.resolve(this.state.getTelegramClient(userId)!)
		}

		const apiId = await this.usersService.apiId(userId).catch((error) => {
			return Promise.reject(error)
		})

		if (!apiId) {
			return Promise.reject(new TelegramServiceError("no_api_id"))
		}

		const apiHash = await this.usersService.apiHash(userId).catch((error) => {
			return Promise.reject(error)
		})

		if (!apiHash) {
			return Promise.reject(new TelegramServiceError("no_api_hash"))
		}

		const encodedSession = this.CURRENT_VERSION + (await this.usersService.session(userId))
		const session = new StringSession(encodedSession)
		const client = new TelegramClient(session ?? `${userId}`, apiId!, apiHash!, { connectionRetries: 5 })

		this.state.setTelegramClient(userId, client)

		return Promise.resolve(client)
	}
}
