export class TablesQueries {
	static createUsers = `
    CREATE TABLE
    IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        username TEXT,
        role TEXT NOT NULL DEFAULT "user",
        last_seen_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        registration_bot TEXT
    )
    `
  
  static createSettings(projectName: string): string {
    return `
    CREATE TABLE
    IF NOT EXISTS ${projectName}_settings (
        user_id BIGINT NOT NULL UNIQUE,
        language_code TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `
  }

  static createTelegramClientCredentials = `
    CREATE TABLE
    IF NOT EXISTS telegram_client_redentials (
        user_id BIGINT NOT NULL UNIQUE,
        api_id BIGINT,
        api_hash TEXT,
        session TEXT,
				FOREIGN KEY (user_id) REFERENCES users (id)
    )
    `
}