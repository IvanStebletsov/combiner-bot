import { UsersService } from "../../Services/UserService/UserService"
import { CoreErrorHandler } from "../../Helpers/CoreErrorHandler"
import { BotContext } from "../../Types/BotContext"

export class LastSeenMiddleware {
	private usersService: UsersService

	constructor(usersService: UsersService) {
		this.usersService = usersService
	}

	async handleLastSeenDate(context: BotContext, next: () => Promise<void>): Promise<void> {
		if (!context.from) {
			return
		}

		this.usersService
			.updateLastSeeDate(context.from.id)
			.then(() => {
				next()
			})
			.catch((error) => CoreErrorHandler.handle(error))
	}
}
