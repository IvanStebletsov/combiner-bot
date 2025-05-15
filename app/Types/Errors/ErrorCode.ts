export type ErrorCode = // Bot Errors

		| "no_user_id"
		| "something_went_wrong"
		// TelegramService Errors
		| "no_api_id"
		| "no_api_hash"
		| "user_not_authorized"
		| "no_chat_with_id"
		| "no_chats_in_folder"
		// UserService Errors
		| "checking_user_existance"
		| "saving_user"
		| "fetching_language_code"
		| "saving_language_code"
		| "fetching_api_id"
		| "saving_api_id"
		| "fetching_api_hash"
		| "saving_api_hash"
		| "fetching_session"
		| "saving_session"
		| "last_seen_date_update"
