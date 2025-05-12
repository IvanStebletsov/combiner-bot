import { Context, SessionFlavor } from "grammy"

export type BotContext = Context & SessionFlavor<BotSessionData>
