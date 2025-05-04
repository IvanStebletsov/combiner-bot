import { LogColor } from "./LogColor"

export class CoreLogger {
	private static fgColors = new Map<LogColor, string>([
		["black", "30"],
		["red", "31"],
		["green", "32"],
		["yellow", "33"],
		["blue", "34"],
		["magenta", "35"],
		["cyan", "36"],
		["white", "37"],
		["gray", "90"],
		["bright_red", "91"],
		["bright_green", "92"],
		["bright_yellow", "93"],
		["bright_blue", "94"],
		["bright_magenta", "95"],
		["bright_cyan", "96"],
		["bright_white", "97"]
	])

	private static bgColors = new Map<LogColor, string>([
		["black", "40"],
		["red", "41"],
		["green", "42"],
		["yellow", "43"],
		["blue", "44"],
		["magenta", "45"],
		["cyan", "46"],
		["white", "47"],
		["gray", "100"],
		["bright_red", "101"],
		["bright_green", "102"],
		["bright_yellow", "103"],
		["bright_blue", "104"],
		["bright_magenta", "105"],
		["bright_cyan", "106"],
		["bright_white", "107"]
	])

	static log(items: { text: any; fg?: LogColor; bg?: LogColor }[]) {
		var result = ""

		for (const item of items) {
			var color = ""

			if (item.fg) {
				color += CoreLogger.fgColors.get(item.fg)

				if (item.bg) {
					color += ";"
				}
			}

			if (item.bg) {
				color += CoreLogger.bgColors.get(item.bg)
			}

			result += `\x1b[${color}m${item.text}\x1b[0m`
		}

		console.log(result)
	}
}
