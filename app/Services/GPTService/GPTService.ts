import OpenAI from "openai"
import { CoreLogger } from "../../Helpers/CoreLogger/CoreLogger"

export class GPTService {
	private client = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY
	})

	async analize(input: string): Promise<string[]> {
		const response = await this.client.responses.create({
			model: "gpt-4.1-mini",
			instructions: `Проанализируй список сообщений из Telegram. Выдели ключевые темы и важные моменты, как в примере ниже. Ответ предоставь в формате JSON с единственным полем 'topics: string[]', где каждый элемент — строка с описанием темы. Используй HTML для форматирования. Используй только эти теги <b></b>, <i></i>, <code></code>, <s></s> и <u></u>, другие не используй. При форматировании используй эмодзи, нумерацию и буллеты, а также используй поле user из сообщений, чтобы в ответе указать на авторов сообщения при необходимости. Поле user используй как есть без изменения текста.
      Пример вывода:
      {
        "topics": [
          "<b>1. Сроки сдачи дома:</b>\nOleg Shokin (@oleganatolievich) сообщает о переносе сроков до 30.06.2025 из-за замены материалов.",
          "<b>2. Парковка:</b>\nAleksandra (@aleksa1508) критикует нарушение правил движения, игнорирование знаков 'кирпич'.",
          "<b>3. Детские площадки:</b>\nТребования к установке качелей (инициатива @MA_Lobo). Отсутствие инфраструктуры для детей."
        ]
      }
      JSON в ответе не форматируй, и ни во что не оборачивай, присылай плоской строкой.  
      `,
			input: `Сообщения для анализа: ${input}`
		})

		const json = response.output_text

		CoreLogger.log([{ text: `[RESPONSE: ${JSON.stringify(JSON.parse(json), null, 4)}`, fg: "bright_magenta" }])

		const topics = JSON.parse(json) as { topics: string[] }

		return Promise.resolve(topics.topics)
	}
}
