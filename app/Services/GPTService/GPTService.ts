import OpenAI from "openai"
import { CoreLogger } from "../../Helpers/CoreLogger/CoreLogger"

export class GPTService {
	private client = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY
	})

	async analize(input: string): Promise<string[]> {
		const response = await this.client.responses.create({
			model: "gpt-4.1-mini",
			instructions: `Проанализируй список сообщений из Telegram. Выдели ключевые темы и важные моменты, как в примере ниже. Ответ предоставь в формате JSON с единственным полем 'topics: string[]', где каждый элемент — строка с описанием темы. Используй Markdown V1 для форматирования (жирный текст — '*', курсив — '_'). Не добавляй другие поля. При форматировании используй эмодзи, нумерацию и буллеты, а также используй поле user из сообщений, чтобы в ответе указать на авторов сообщения при необходимости.
      Пример вывода:
      {
        "topics": [
          "*1. Сроки сдачи дома*: Oleg Shokin (@oleganatolievich) сообщает о переносе сроков до 30.06.2025 из-за замены материалов.",
          "*2. Парковка*: Aleksandra (@aleksa1508) критикует нарушение правил движения, игнорирование знаков 'кирпич'.",
          "*3. Детские площадки*: Требования к установке качелей (инициатива @MA_Lobo). Отсутствие инфраструктуры для детей."
        ]
      }
      JSON в ответе не форматируй, и ни во что не оборачивай, присылай плоской строкой.  
      `,
			input: `Сообщения для анализа: ${input}`
		})

		CoreLogger.log([{ text: `[RESPONSE: ${JSON.stringify(response, null, 4)}`, fg: "bright_magenta" }])

		const unescapedText = response.output_text

		CoreLogger.log([{ text: `[RESPONSE: ${JSON.stringify(JSON.parse(unescapedText), null, 4)}`, fg: "bright_magenta" }])

		const topics = JSON.parse(unescapedText) as { topics: string[] }

		return Promise.resolve(topics.topics)
	}
}
