import { CoreLogger } from "./CoreLogger/CoreLogger"

/**
 * Handler for errors
 */
export class CoreErrorHandler {
	static handle(error: any) {
		CoreLogger.log([{ text: "[ERROR]:", fg: "bright_white", bg: "bright_red" }, { text: ` ${error}` }])
	}
}
