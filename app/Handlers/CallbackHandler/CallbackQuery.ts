import { CoreUtils } from "../../Helpers/CoreUtils"
import { CallSource } from "../../Types/CallSource"

export class CallbackQuery {
	static Authorize(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("authorize", { from: from })
	}

	static HowToGrantAccess(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("h_t_gr_acc", { from: from })
	}

	static GiveAuthCreds(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("give_auth_creds", { from: from })
	}

	static GiveAppCreds(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("give_app_creds", { from: from })
	}

	static AddApiId(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("add_api_id", { from: from })
	}

	static ListOfFolders(from?: CallSource, page?: number): { query: string; regex: RegExp } {
		return this.makeQuery("fd_lst", {
			from: from,
			pg: page
		})
	}

	static ListOfChats(
		from?: CallSource,
		allUnread?: boolean,
		page?: number,
		folderId?: number,
		foldersPage?: number
	): { query: string; regex: RegExp } {
		return this.makeQuery("chts_lst", {
			from: from,
			a_urnd: allUnread,
			pg: page,
			fd_id: folderId,
			fd_pg: foldersPage
		})
	}

	static ReadUnreadChatMessages(from?: CallSource, chatId?: number): { query: string; regex: RegExp } {
		return this.makeQuery("rd_unrd_cht_msgs", {
			from: from,
			cid: chatId
		})
	}

	static DoNothing(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("do_nthg", { from: from })
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
