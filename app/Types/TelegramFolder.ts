import { Api } from "telegram"
import { TelegarmChat } from "./TelegarmChat"

export class TelegramFolder {
	id: number
	title: string
	chats: TelegarmChat[]

	constructor(type: Api.TypeDialogFilter) {
		if (type instanceof Api.DialogFilter) {
			this.id = type.id
			this.title = type.title.text
			this.chats = type.includePeers.map((includedPeer) => {
				return new TelegarmChat(includedPeer)
			})
		} else if (type instanceof Api.DialogFilterChatlist) {
			this.id = type.id
			this.title = type.title.text
			this.chats = type.includePeers.map((includedPeer) => {
				return new TelegarmChat(includedPeer)
			})
		}
	}
}
