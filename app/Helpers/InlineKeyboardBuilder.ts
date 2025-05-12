import { CoreUtils } from "./CoreUtils"
import { InlineKeyboard } from "grammy"

export class InlineKeyboardBuilder {
	/**
	 * Method builds inline keyboard with various count of buttons
	 * @param buttons List of tuples with title and CallbackQuery
	 * @returns
	 */
	static makeKeyboard(...buttons: Array<Array<[string, string]>>): InlineKeyboard | undefined {
		if (CoreUtils.isEmpty(buttons)) {
			return undefined
		}

		const keyboard = new InlineKeyboard()

		buttons.forEach((rowButton) => {
			rowButton.forEach((button) => {
				keyboard.text(button[0], button[1])
			})
			keyboard.row()
		})

		return keyboard
	}
}