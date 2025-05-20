import { CoreCache } from "../../Cache/CoreCache"
import { CoreCacheConstants } from "../../Cache/CoreCacheConstants"
import * as localized from "./Localized.json"

export class Localized {
    /**
     * - ru: 👋 *Привет!*Я помогу тебе быть в курсе того, что обсуждается в длинных переписках без долгого вникания в их суть, прочту их за тебя, кратко перескажу содержание и выделю то, что может быть важным.Для работы мне будет необходим доступ к твоему Telegram аккаунту, это не совсем безопасно, поэтому если сомневаешься стоит ли мной пользоваться, то лучше не пользуйся, иначе мне придётся хранить некоторые твои идентификаторы в базе данных в незашифрованном виде, а именно *api_id*, *api_hash* и *session_id*.Если ты твердо и четко решил, что готов предоставить мне доступ, то вызови команду /how\_to\_grant\_access и следуй инструкции.❗ У тебя всегда есть опции сбросить свои идентификаторы в консоли Telegram, разлогинить меня из своего аккаунта через клиент Telegram, а также попросить меня удалить твои идентификаторы из моей базы с помощью команды /clear\_my\_ids.
     * - en: 👋 *Hi!*I will help you keep abreast of what is discussed in long correspondence without delving into their essence for a long time, I will read them for you, briefly summarize the content and highlight what may be important.For work, I will need access to your Telegram account, it's not completely secure, so if you doubt whether you should use me, then don't do it, otherwise I will have to store some of your identifiers in the database in unencrypted form, namely *api_id*, *api_hash* and *session_id*.If you have firmly and clearly decided that you are ready to grant me access, then call the /how\_to\_grant\_access command and follow the instructions.❗ You always have the options to reset your IDs in the Telegram console, log me out of your account via the Telegram client, and also ask me to delete your IDs from my database using the /clear\_my\_ids command.
     */
    static welcome_message_initial(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.welcome_message_initial[languageCode]
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
     * - ru: 🗂️ Выбери папку для просмотра чатов:
     * - en: 🗂️ Select a folder to view chats in:
     */
    static list_of_folders_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.list_of_folders_message[languageCode]
    }

    /**
     * - ru: 💬 Выбери чат в котором нужно прочитать сообщения:
     * - en: 💬 Select the chat where you want to read the messages:
     */
    static list_of_chats_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.list_of_chats_message[languageCode]
    }

    /**
     * - ru: 🤔 Как авторизоваться?
     * - en: 🤔 How to logged in?
     */
    static how_to_grant_access_message_action(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.how_to_grant_access_message_action[languageCode]
    }

    /**
     * - ru: Чтобы предоставить мне доступ к твоему Telegram аккаунту:1\) Перейди на сайт *Telegram core*: https://my\.telegram\.org2\) Авторизауйся по своему номеру телефона3\) Перейди в раздел *API development tools*4\) Заполни чем угодно поля *App title*, *Short name* и *Description*, поле *URL* можешь оставить пустым, а в *Platform* выбери *Other*5\) Нажми *Create application* чтобы завершить создание приложения6\) После создания приложения появятся поля *App api\_id* и *App api\_hash*, их нужно передать мне, для этого нажми кнопку внизу
     * - en: To give me access to your Telegram account:1\) Go to the *Telegram core* website: https://my\.telegram\.org2\) Log in using your phone number3\) Go to the *API development tools* section4\) Fill in the *App title*, *Short name* and *Description* fields with anything, you can leave the *URL* field empty, and in *Platform* select *Other*5\) Click *Create application* to complete creating an application6\) After creating the application, the fields *App api\_id* and *App api\_hash* will appear, they need to be sent to me, to do this, click button at the bottom
     */
    static how_to_grant_access_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.how_to_grant_access_message[languageCode]
    }

    /**
     * - ru: 🔒 Ты не авторизован.{0}
     * - en: 🔒 You are not logged in.{0}
     */
    static unauthorized_message(param0: any, userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return this.formatString(localized.unauthorized_message[languageCode], param0)
    }

    /**
     * - ru:  Авторизуйся повторно.Кстати, твои текущие *app_id* и *app_hash* еще актуальны или нужно использовать новые?
     * - en:  Log in again.By the way, your current *app_id* and *app_hash* still relevant or do I need to use new ones?
     */
    static unauthorized_message_details(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.unauthorized_message_details[languageCode]
    }

    /**
     * - ru: ❌ Закрыть
     * - en: ❌ Close
     */
    static close_action(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.close_action[languageCode]
    }

    /**
     * - ru: 👌🏻 Актуальны
     * - en: 👌🏻 Relevant
     */
    static unauthorized_positive_action(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.unauthorized_positive_action[languageCode]
    }

    /**
     * - ru: 🙅🏻‍♂️ Нужно обновить
     * - en: 🙅🏻‍♂️ Need to update
     */
    static unauthorized_negative_action(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.unauthorized_negative_action[languageCode]
    }

    /**
     * - ru: 😌 В этом чате нет нерпочитанных сообщений, можешь расслабиться.
     * - en: 😌 There are no unread messages in this chat, you can relax.
     */
    static no_unread_messages(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.no_unread_messages[languageCode]
    }

    /**
     * - ru: 🤷🏻‍♂️ В этой папке нет чатов.
     * - en: 🤷🏻‍♂️ There are no chats in this folder.
     */
    static no_chats(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.no_chats[languageCode]
    }

    /**
     * - ru: 🎉 Готово! Доступ получен!
     * - en: 👌🏻 Ready! Access has been granted!
     */
    static authorization_complete_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.authorization_complete_message[languageCode]
    }

    /**
     * - ru: 👌🏻 Авторизоваться
     * - en: 👌🏻 Authorize
     */
    static authorize_action(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.authorize_action[languageCode]
    }

    /**
     * - ru: ↩️ Назад
     * - en: ↩️ Back
     */
    static back_action(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.back_action[languageCode]
    }

    /**
     * - ru: Передать идентификаторы
     * - en: Give IDs
     */
    static give_ids(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.give_ids[languageCode]
    }

    /**
     * - ru: Скопируй и пришли свой *app_id*
     * - en: Copy and send your *app_id*
     */
    static add_app_id_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.add_app_id_message[languageCode]
    }

    /**
     * - ru: Отлично! 👍Теперь, скопируй и пришли свой *app_hash*
     * - en: Great! 👍Now, copy and send your *app_hash*
     */
    static add_app_hash_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.add_app_hash_message[languageCode]
    }

    /**
     * - ru: Супер! 🤩Теперь напиши свой номер телефона в формате +CODENUMBER, где CODE - код страны, например +7 и NUMBER - номер телефона. На этот номер я отправлю код доступа.
     * - en: Super! 🤩Now write your phone number in the +CODENUMBER format, where CODE is county code, for example +7 and NUMBER is the phone number. I will send the access code to this number.
     */
    static phone_number_request_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.phone_number_request_message[languageCode]
    }

    /**
     * - ru: Замечательно! 🌈Теперь, скопируй и пришли код, который я выслал в формате "X X X X X" с пробелом после каждой цифры кода, напирмер 72134 -> 7 2 1 3 4
     * - en: Wonderful! 🌈 Now, copy and send the code that I sent in the "X X X X X" format with space after each digit, for example 72134 -> 7 2 1 3 4
     */
    static auth_code_request_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.auth_code_request_message[languageCode]
    }

    /**
     * - ru: И последнее! 😮‍💨У тебя установлена *2FA*, мне нужен твой *облачный пароль*. Хранить мы его не будем 🤞🏻.
     * - en: And one last thing! 😮‍💨 You have *2FA* installed, I need your *cloud password*. We will not keep it 🤞🏻.
     */
    static two_fa_password_request_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.two_fa_password_request_message[languageCode]
    }

    /**
     * - ru: Данный вид сообщений не поддерживается
     * - en: This type of message is not supported
     */
    static unsupported_message_type(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.unsupported_message_type[languageCode]
    }

    /**
     * - ru: 🧹 Твои идентификаторы *app_id*, *app_hash* и *session_id* были удалены. Не забудь также разлогинить меня/завершить сессию через Telegram клиент.Пока 👋🏻
     * - en: 🧹 Your *app_id*, *app_hash*, and *session_id* IDs have been deleted. Don't forget to also log me out/end the session via the Telegram client.See you 👋🏻
     */
    static user_ids_have_been_cleared(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.user_ids_have_been_cleared[languageCode]
    }

    /**
     * - ru: 🧑🏻‍🦽‍➡️  Твой *app_id* и *app_hash* недействителен.
     * - en: 🧑🏻‍🦽‍➡️  Your *app_id* and *app_hash* are invalid.
     */
    static invalid_app_id_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.invalid_app_id_message[languageCode]
    }

    /**
     * - ru: 🔑  Твой *auth_key* используется в двух сессиях параллельно, заверши одну из сессий.
     * - en: 🔑  Your *auth_key* is used in two sessions in parallel, completed one of the sessions.
     */
    static auth_key_duplicated_message(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.auth_key_duplicated_message[languageCode]
    }

    /**
     * - ru: 👌🏻  Обновить
     * - en: 👌🏻  Update
     */
    static invalid_cred_positive_action(userId: number): string {
        const languageCode = this.getLanguageCode(userId)
        return localized.invalid_cred_positive_action[languageCode]
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
