import { CoreUtils } from "../../Helpers/CoreUtils"

export class CallbackQuery {
	static Authorize(): { query: string; regex: RegExp } {
		return this.makeQuery("authorize")
	}

	static HowToGrantAccess(): { query: string; regex: RegExp } {
		return this.makeQuery("h_t_gr_acc")
	}

	static GiveAuthCreds(): { query: string; regex: RegExp } {
		return this.makeQuery("give_auth_creds")
	}

	static GiveAppCreds(): { query: string; regex: RegExp } {
		return this.makeQuery("give_app_creds")
	}

	static MarkAsRead(chatId?: number, messageId?: number): { query: string; regex: RegExp } {
		return this.makeQuery("mk_as_rd", { cid: chatId, mid: messageId })
	}

	static ListOfFolders(page?: number): { query: string; regex: RegExp } {
		return this.makeQuery("fd_lst", { pg: page })
	}

	static ListOfChats(
		allUnread?: boolean,
		page?: number,
		folderId?: number,
		foldersPage?: number
	): { query: string; regex: RegExp } {
		return this.makeQuery("chts_lst", {
			a_unrd: allUnread,
			pg: page,
			fd_id: folderId,
			fd_pg: foldersPage
		})
	}

	static ReadUnreadChatMessages(chatId?: number): { query: string; regex: RegExp } {
		return this.makeQuery("rd_unrd_cht_msgs", { cid: chatId })
	}

	static DeleteMessage(messageId?: number): { query: string; regex: RegExp } {
		return this.makeQuery("dlt_msg", { mid: messageId })
	}

	static DoNothing(): { query: string; regex: RegExp } {
		return this.makeQuery("do_nthg")
	}

	private static makeQuery(path: string, query: Record<string, any> = {}): { query: string; regex: RegExp } {
		return {
			query: CoreUtils.urlToCallbackQuery(
				path,
				Object.entries(query).reduce((a: Record<string, any>, [k, v]) => (v == null ? a : ((a[k] = v), a)), {})
			),
			regex: RegExp(`/${path}?`)
		}
	}
}
