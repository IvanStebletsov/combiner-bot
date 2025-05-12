import { TelegramClient } from "telegram"
import { UserState } from "../Types/UserState"

export class State {
	private state: { [userId: number]: UserState } = {}

	getTelegramClient(userId: number): TelegramClient | undefined {
		this.createStateIfNeeded(userId)

		return this.state[userId].telegramClient
	}

	setTelegramClient(userId: number, telegramClient: TelegramClient) {
		this.createStateIfNeeded(userId)

		this.state[userId].telegramClient = telegramClient
	}

	deleteTelegramClient(userId: number) {
		this.state[userId].telegramClient = undefined
	}

	private createStateIfNeeded(userId: number) {
		if (!this.state[userId]) {
			this.state[userId] = new UserState()
		}
	}
}
