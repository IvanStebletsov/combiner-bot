import { CoreCache } from "../../Cache/CoreCache"
import { CoreCacheConstants } from "../../Cache/CoreCacheConstants"
import * as localized from "./Localized.json"

export class Localized {
    /**
     * - ru: 👋 *Привет!*Я помогу тебе скачать из Instagram и TikTok:– Фото 📸– Видео 📹– Истории 🎭– Музыку 🎧Шли мне ссылки на посты из приложения, а я постараюсь их скачать и прислать тебе, чтобы ты мог сохранить их у себя и поделиться с друзьями в мессенджерах.❗️P.S.: Имей в виду, что посты должны быть из *открытых аккаунтов*.
     * - en: 👋 *Hi!* I will help you download from Instagram and TikTok:– Photos 📸– Videos 📹– Stories 🎭– Music 🎧Send me links to posts from the application, and I will try to download them and send them to you so that you can keep them and share them with friends in messengers.❗️P.S.: Keep in mind that posts should come from *open accounts*.
     */
    static welcome_message_initial(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.welcome_message_initial[languageCode]
    }

    /**
     * - ru: ❓ *F\.A\.Q\. \(Часто задаваемые вопросы\)**Как работают токены в вашем сервисе\?* 🎫Для использования нашего сервиса вам понадобятся токены\. Каждое слово в ваших вводных данных или запросе, а также каждое слово в ответе нашего ассистента, стоит **1 токен**\. Все запросы рассчитываются на основании количества слов, что определяет потребность в токенах\. Токены можно приобрести, используя команду /top\_up в боте🚗 *Как добавить мой автомобиль в систему\?*Перейдите в /settings и следуйте инструкциям для добавления нового автомобиля\. Вы можете добавить и управлять несколькими автомобилями\.🌐 *Как изменить язык бота\?*Вы можете легко изменить язык общения бота в /settings\. Мы поддерживаем несколько языков для вашего удобства\.💬 *Бот говорит слишком профессионально \(или слишком просто\)\. Могу ли я изменить это\?*Конечно\! Вы можете выбрать стиль общения бота в /settings\. Он может говорить как профессионал, как гаражный механик или объяснять все как для детей\.🔍 *Бот дает слишком короткие ответы на мои вопросы\. Что делать\?*Мы создали бота таким образом, чтобы он предоставлял краткие, сжатые ответы для быстрого ознакомления\. Если вам нужно больше информации, просто нажмите кнопку "Подробнее"\.🧠 *Как бот сохраняет контекст моих сообщений\?*Бот автоматически сохраняет историю общения для более точного и последовательного ответа на ваши вопросы\. Это значит, что вы можете продолжить обсуждение проблемы, как если бы вы общались с настоящим человеком\. Например, вы спросили\:_Моя машина перегревается после 5 минут работы_и бот ответил\:_1\. Проверьте уровень антифриза в системе охлаждения\.2\. Проверьте работоспособность вентилятора радиатора_\.Затем, если вы спросите\:_Как проверить работоспособность вентилятора\?_Бот будет понимать, что вы обсуждаете второй пункт его предыдущего ответа и предоставит подробные инструкции по проверке вентилятора радиатора\. Чтобы сбросить контекст и начать обсуждение новой проблемы, просто еще раз вызовете команду /start\.🔄 *Я перешел на другую тему, будет ли бот понимать меня\?*Благодаря сохранению контекста, бот может следовать за изменением темы в разговоре\. Однако, чтобы обеспечить наиболее точные ответы, рекомендуется сохранять каждую тему отдельно и ясно формулировать вопросы\.🆘 *Мне нужна дополнительная помощь или у меня есть проблемы с ботом\. Что мне делать\?*Если у вас возникли проблемы или вам нужна дополнительная помощь, не стесняйтесь обращаться к нам \(@mattisssa, @IvanStebletsov\)\. Мы здесь, чтобы помочь вам\!🤝 Мы надеемся, что эта информация поможет вам в работе с нашим ботом\. Если у вас возникнут другие вопросы, мы всегда готовы помочь\!
     * - en: ❓ *F\.A\.Q\. \(Frequently Asked Questions\)**How do I add my car to the system\?*Go to /settings and follow the instructions to add a new car\. You can add and manage multiple cars\.*How do I change the bot's language\?*You can easily change the bot's language in /settings\. We support multiple languages for your convenience\.*The bot talks too professionally \(or too simply\)\. Can I change that\?*Certainly\! You can select the bot's communication style in /settings\. It can speak like a professional, like a garage mechanic, or explain everything as if for children\.*The bot gives too short answers to my questions\. What to do\?*We designed the bot to provide brief, compressed answers for quick reference\. If you need more information, just click the "more details" button\.*How does the bot preserve the context of my messages\?*The bot automatically saves the chat history for more accurate and consistent responses to your questions\. This means you can continue discussing the problem as if you were talking to a real person\. For example, you asked\:_My car is overheating after 5 minutes of running_and the bot responded\:_1\. Check the coolant level in the cooling system\.2\. Check the radiator fan operation_\.3\. \.\.\.Then, if you ask\:_How to do the point 2\?_The bot will understand that you are discussing the second point of its previous response and will provide detailed instructions on how to check the radiator fan\.*I switched to another topic, will the bot understand me\?*Thanks to preserving the context, the bot can follow the change of topics in the conversation\. However, to ensure the most accurate answers, it is recommended to keep each topic separate and to formulate questions clearly\.*I need additional help or I have problems with the bot\. What should I do\?*If you have any problems or need additional help, don't hesitate to contact us \(@mattisssa, @IvanStebletsov\)\. We are here to help you\!We hope this information will help you work with our bot\. If you have any other questions, we are always ready to help\!
     */
    static faq_text(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.faq_text[languageCode]
    }

    /**
     * - ru: SourceUrl: {0} и destinationUrl: {1} сохранение завершилось с ошибкой.{2}
     * - en: SourceUrl: {0} and destinationUrl: {1} saving has failed.{2}
     */
    static url_saving_failed(param0: any, param1: any, param2: any, userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return this.formatString(localized.url_saving_failed[languageCode], param0, param1, param2)
    }

    /**
     * - ru: Получение destinationUrl для sourceUrl: {0} завершилось с ошибкой.{1}
     * - en: DestinationUrl fetching for sourceUrl: {0} has failed.{1}
     */
    static url_getting_failed(param0: any, param1: any, userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return this.formatString(localized.url_getting_failed[languageCode], param0, param1)
    }

    /**
     * - ru: Кажется я не могу ничего скачать из этой соц сети. Либо что-то не так с URL 🧐
     * - en: It seems I can't download anything from this social network. Or something is wrong with the URL 🧐
     */
    static unsupported_resource_for_downloading(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.unsupported_resource_for_downloading[languageCode]
    }

    /**
     * - ru: ⏳
     * - en: ⏳
     */
    static loading_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.loading_message[languageCode]
    }

    /**
     * - ru: 🎚 *Настройки*Здесь ты можешь изменить язык интерфейса
     * - en: 🎚 *Settings*Here you can change the interface language
     */
    static settings_description(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.settings_description[languageCode]
    }

    /**
     * - ru: Мы получили ошибку 404: Not Found 🚧.Кажется такого материала больше не существует 🙅🏻‍♂️URL: {0}
     * - en: We received the error 404: Not Found 🚧.It seems that such material no longer exists 🙅🏻‍♂️URL: {0}
     */
    static error_not_found(param0: any, userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return this.formatString(localized.error_not_found[languageCode], param0)
    }

    /**
     * - ru: Мы получили ошибку 401: Unauthorized 🔒.Доступ к данному материалу закрыт 🙅🏻‍♂️.Имей в виду, что посты должны быть из *открытых аккаунтов*URL: {0}
     * - en: We received the error 401: Unauthorized 🔒.Access to this material is closed 🙅🏻‍♂️.Keep in mind that posts should come from *open accounts*.URL: {0}
     */
    static error_unauthorized(param0: any, userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return this.formatString(localized.error_unauthorized[languageCode], param0)
    }

    /**
     * - ru: Данный вид сообщений пока не поддерживается
     * - en: This type of message is not supported yet
     */
    static unsupported_message_type(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.unsupported_message_type[languageCode]
    }

    /**
     * - ru: Что-то пошло не так, но вот ссылка для скачай.{1}
     * - en: Something went wrong, but here is the link for downloading.{1}
     */
    static something_went_wrong(param0: any, userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return this.formatString(localized.something_went_wrong[languageCode], param0)
    }

    private static getLanguageCode(userId: number): string {
        return CoreCache.shared.get<string>(CoreCacheConstants.languageCode(userId)) ?? "ru"
    }

    private static formatString(str: string, ...val: string[]) {
        for (let index = 0; index < val.length; index++) {
            str = str.replace(`{${index}}`, val[index])
        }
        return str
    }
}
