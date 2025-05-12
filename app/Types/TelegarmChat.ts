import { Api } from "telegram"

export class TelegarmChat {
	chatId: number
	userId: number
	channelId: number
	className: "InputPeerChat" | "InputPeerUser" | "InputPeerChannel"

	constructor(type: Api.TypeInputPeer) {
		if (type instanceof Api.InputPeerChat) {
			this.chatId = Number(type.chatId)
			this.className = type.className
		} else if (type instanceof Api.InputPeerUser) {
			this.userId = Number(type.userId)
			this.className = type.className
		} else if (type instanceof Api.InputPeerChannel) {
			this.userId = Number(type.channelId)
			this.className = type.className
		}
	}
}
