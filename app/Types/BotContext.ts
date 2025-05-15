import { Context, SessionFlavor } from "grammy"
import { BotSessionData } from "./BotSessionData"

export type BotContext = Context & SessionFlavor<BotSessionData>
