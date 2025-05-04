import input from "input"
import * as dotenv from "dotenv"
import { run } from "@grammyjs/runner"
import { Assembly } from "./Helpers/Assembly"
import { generateUpdateMiddleware } from "telegraf-middleware-console-time/dist"
import { CoreErrorHandler } from "./Helpers/CoreErrorHandler"
import { CoreLogger } from "./Helpers/CoreLogger/CoreLogger"
import { Context } from "grammy"
import { Message } from "./Models/Message"

dotenv.config()

class App {
	private bot = Assembly.shared.bot
	private client = Assembly.shared.client
	private messageHandler = Assembly.shared.messageHandler

	async main() {
		// Middleware
		this.bot.use(generateUpdateMiddleware())

		// Messages
		this.bot.on("message", (context) => {
			// this.messageHandler.handleMessage(context)
			this.start(context)
		})

		this.bot.catch((error) => CoreErrorHandler.handle(error))

		// Bot launch
		run(this.bot)

		CoreLogger.log([{ text: `Bot is running...`, fg: "green" }])
	}

	async start(context: Context) {
		await this.client.connect()
		const isAuthorized = await this.client.checkAuthorization()

		CoreLogger.log([{ text: `[IS AUTHORIZED]: ${isAuthorized}`, fg: "green" }])

		if (isAuthorized) {
			const chats = await this.client.getDialogs()
				// .filter((dialog) => dialog.unreadCount > 0)
				// .sort((lhs, rhs) => rhs.unreadCount - lhs.unreadCount)

			const chat = chats.find((dialog) => dialog.entity?.id.toString() == "1996184293")

			CoreLogger.log([{ text: `[TOTAL DIALOGS]: ${chats.total}`, fg: "green" }])

			// for (const dialog of unreadedDialogs) {
			if (chat) {
				CoreLogger.log([{ text: `[DIALOG]: ${chat.title} - ${chat.unreadCount} (${chat.entity?.id})`, fg: "green" }])

				var counter = chat.unreadCount
				var unreadMessages: Array<Message> = []

				for await (const message of this.client.iterMessages(chat.entity)) {
					if (!message.text) {
						continue
					}

					if (counter < 1) {
						break
					}

					var username = ""

					if (message.fromId) {
						const entity = await this.client.getEntity(message.fromId)
						const firstName = entity["firstName"]
						const lastName = entity["lastName"]
						const nickName = entity["username"]

						if (firstName) {
							username += firstName
						}

						if (lastName) {
							username += ` ${lastName}`
						}

						if (nickName) {
							username += ` (@${nickName})`
						}
					}

					// console.log(JSON.stringify(message, null, 4))
					const date = new Date(message.date * 1000)
					const unreadMessage = new Message(
						username,
						message.date,
						date,
						message.text
					)
					unreadMessages.push(unreadMessage)

					// CoreLogger.log([{ text: `\n[MESSAGES]: ${JSON.stringify(unreadMessages, null, 4)}`, fg: "green" }])

					// await context.reply(`👤 ${username}\n\n✉️ ${message.text}`)
					counter -= 1
			 	}


				 CoreLogger.log([{ text: `\n[MESSAGES]: ${JSON.stringify(unreadMessages, null, 4)}`, fg: "green" }])
			}
			// }
		} else {
			this.authorize()
		}
	}

	async authorize() {
		await this.client.start({
			phoneNumber: async () => await input.text("Please enter your number: "),
			password: async () => await input.text("Please enter your password: "),
			phoneCode: async () => await input.text("Please enter the code you received: "),
			onError: (err) => console.log(err),
		})
		console.log("You should now be connected.");
		console.log(this.client.session.save()); // Save this string to avoid logging in again
		// await this.client.sendMessage("me", { message: "Hello!" });
	}
}

new App().main()
