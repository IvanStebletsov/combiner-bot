import { CoreCache } from "./CoreCache"
import { CoreUtils } from "../Helpers/CoreUtils"
import { CoreCacheConstants } from "./CoreCacheConstants"
import { UsersService } from "../Services/UserService/UserService"
import { BotContext } from "../Types/BotContext"

export class CacheMiddleware {
	private usersService: UsersService
	private cache: CoreCache

	constructor(usersService: UsersService, cache: CoreCache) {
		this.usersService = usersService
		this.cache = cache
	}

	async handleCache(context: BotContext, next: () => Promise<void>): Promise<void> {
		await this.handleLanguageCodeCaching(context)
		next()
	}

	private async handleLanguageCodeCaching(context: BotContext): Promise<void> {
		if (!context.from || !process.env.PROJECT_NAME) {
			return
		}

		const key = CoreCacheConstants.languageCode(context.from.id)
		const cachedLanguageCode = this.cache.get<string>(key)
		const savedLanguageCode = await this.usersService.languageCode(context.from.id, process.env.PROJECT_NAME)

		if (CoreUtils.isEmpty(cachedLanguageCode) && CoreUtils.isNotEmpty(savedLanguageCode)) {
			this.cache.set(savedLanguageCode, key)
		} else if (CoreUtils.isNotEmpty(savedLanguageCode) && cachedLanguageCode !== savedLanguageCode) {
			this.cache.set(savedLanguageCode, key)
		} else if (CoreUtils.isEmpty(cachedLanguageCode) && CoreUtils.isEmpty(savedLanguageCode)) {
			const userLanguageCode = context.from.language_code === "en" ? "en" : "ru"
			this.cache.set(userLanguageCode, key)
		}
	}
}
