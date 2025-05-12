import { CoreUtils } from "../../Helpers/CoreUtils"
import { CallSource } from "../../Types/CallSource"

export class CallbackQuery {
	static Authorize(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("authorize", { from: from })
	}

	static HowToGrantAccess(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("how_to_grant_access", { from: from })
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
		return this.makeQuery("list_of_folders", {
			from: from,
			pg: page
		})
	}

	static ListOfChats(
		from?: CallSource,
		page?: number,
		folder?: number,
		foldersPage?: number
	): { query: string; regex: RegExp } {
		return this.makeQuery("list_of_chats", {
			from: from,
			pg: page,
			fd: folder,
			fd_pg: foldersPage
		})
	}

	static DoNothing(from?: CallSource): { query: string; regex: RegExp } {
		return this.makeQuery("do_nothing", { from: from })
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
