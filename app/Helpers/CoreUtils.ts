import { Context } from "grammy"
import { InlineKeyboardMarkup, ParseMode } from "grammy/types"
import { CoreErrorHandler } from "./CoreErrorHandler"

type Abbreviations = {
	[key: string]: number
}

const abbreviations: Abbreviations = {
	K: 1000,
	M: 1000000,
	B: 1000000000,
	T: 1000000000000
}

export class CoreUtils {
	/**
	 * Method checks is value null or undefined or just empty, like empty string or empty array.
	 * @param value Whatever what can be equal to null or undefined or can has length equal to zero.
	 * @returns True if value equal to null or undefined or has length equal to zero, otherwise returns false
	 */
	static isEmpty(value: any): boolean {
		return value === null || value === undefined || value.length === 0
	}

	/**
	 * Method checks is value not null, not undefined or not empty string or empty array.
	 * @param value Whatever what can be equal to null or undefined or can has length equal to zero.
	 * @returns True if value not equal to null or undefined or has length greater then zero, otherwise returns false
	 */
	static isNotEmpty(value: any): boolean {
		if (typeof value === "string" || Array.isArray(value)) {
			return value !== undefined && value !== null && value.length > 0
		} else {
			return value !== undefined && value !== null
		}
	}

	/**
	 * Method extracts all URLs from text
	 * @param text Source test
	 * @returns Array of string URLs
	 */
	static findURLs(text: string): string[] {
		const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
		return text.match(urlRegex) as string[]
	}

	/**
	 * Method throttles async function calls
	 * @param func function to throttle
	 * @param delay delay in milliseconds
	 * @returns throttled function
	 */
	static throttleAsync<T extends (...args: any[]) => Promise<any>>(func: T, delay: number) {
		var lastCall = 0

		return async function (...args: Parameters<T>): Promise<ReturnType<T> | undefined> {
			const now = new Date().getTime()
			if (now - lastCall < delay) {
				return
			}
			lastCall = now
			return await func(...args)
		}
	}

	/**
	 * Method escapes special symbols
	 * @param value String for escaping special symbols
	 * @returns String with escaped special symbols or undefined if value is not a string
	 */
	static escape(value: string | undefined) {
		if (typeof value === "string") {
			return value.replace(/[.*+?^'`"${}()|[\]\\]/g, "\\$&")
		}
		return undefined
	}

	/**
	 * Removes all whitespace from string
	 * @param inputString
	 * @returns
	 */
	static removeWhitespace(inputString: string): string {
		return inputString.replace(/[\n\t\r]/g, "")
	}

	/**
	 * Method builds URL like CallbackQuery string
	 * @param path URL path
	 * @param queryItems Query parameters
	 * @returns URL like CallbackQuery string
	 */
	static urlToCallbackQuery(path: string, queryItems: { [key: string]: string } = {}): string {
		var url = new URL("https://anyhost.bot")
		url.pathname = path

		if (Object.entries(queryItems).length > 0) {
			for (const [key, value] of Object.entries(queryItems)) {
				url.searchParams.append(key, value)
			}
			return [url.pathname.toString(), url.searchParams.toString()].join("?")
		} else {
			return url.pathname.toString()
		}
	}

	/**
	 * Method builds URL from CallbackQuery string
	 * @param callbackQuery CallbackQuery string
	 * @returns URL object ready for extraction of URL parametrs
	 */
	static callbackQueryToUrl(callbackQuery: string): URL {
		return new URL(`https://anyhost.bot${callbackQuery}`)
	}

	/**
	 * Method that format token amount to human readable format
	 * @param amount Token amount
	 * @returns	Formatted token amount 100 000 -> 100K and etc.
	 */
	static formatTokenAmount(amount: number): string {
		for (const key in abbreviations) {
			if (amount >= abbreviations[key] && amount < abbreviations[key] * 1000) {
				return `${(amount / abbreviations[key]).toFixed(0)}${key}`
			}
		}

		return amount.toString()
	}

	/**
	 * Method imitate message sending by chunks
	 * @param message Whole message text
	 * @param context Bot's context
	 */
	static async replayWithChunks(
		message: string,
		context: Context,
		reply_markup?: InlineKeyboardMarkup,
		parseMode?: ParseMode
	) {
		if (!context.from?.id) {
			return
		}

		const messageChunks = this.breakMessageIntoChunks(message)

		// send the first part of the message
		const sentMessage = await context
			.reply(`${messageChunks[0]}...`, { reply_markup: reply_markup })
			.catch((error) => CoreErrorHandler.handle(error))

		// Check that sentMessage is defined and of type 'TextMessage'
		if (sentMessage && "message_id" in sentMessage) {
			// Append the message with remaining parts
			let appendedMessage = messageChunks[0]

			for (let i = 1; i < messageChunks.length; i++) {
				await new Promise((resolve) => setTimeout(resolve, 1000))
				appendedMessage += messageChunks[i]
				const isFinal = messageChunks.length - 1 == i
				await context.api
					.editMessageText(
						context.from.id,
						sentMessage.message_id,
						`${appendedMessage}${isFinal ? "" : "..."}`,
						isFinal ? { reply_markup: reply_markup, parse_mode: parseMode } : undefined
					)
					.catch((error) => CoreErrorHandler.handle(error))
			}
		}
	}

	/**
	 * Method imitate message editing by chunks
	 * @param message Whole message text
	 * @param context Bot's context
	 */
	static async editMessageWithChunks(
		message: string,
		context: Context,
		reply_markup?: InlineKeyboardMarkup,
		parseMode?: ParseMode
	) {
		if (!context.from?.id) {
			return
		}

		const messageChunks = this.breakMessageIntoChunks(message)

		await context
			.editMessageText(`${messageChunks[0]}...`, { reply_markup: reply_markup })
			.catch((error) => CoreErrorHandler.handle(error))

		let appendedMessage = ""

		for (let i = 0; i < messageChunks.length; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
			appendedMessage += messageChunks[i]
			const isFinal = messageChunks.length - 1 == i
			await context
				.editMessageText(
					`${appendedMessage}${isFinal ? "" : "..."}`,
					isFinal ? { reply_markup: reply_markup, parse_mode: parseMode } : undefined
				)
				.catch((error) => CoreErrorHandler.handle(error))
		}
	}

	/**
	 * Method breaks whole message onto bunches
	 * @param message
	 * @returns
	 */
	private static breakMessageIntoChunks(message: string) {
		const messageLength = message.length
		const partLength = Math.random() * (messageLength / 5) + messageLength / 5
		let messageParts = [message.slice(0, partLength)]

		for (let i = partLength; i < messageLength; i += partLength) {
			messageParts.push(message.slice(i, i + partLength))
		}

		return messageParts
	}
}
