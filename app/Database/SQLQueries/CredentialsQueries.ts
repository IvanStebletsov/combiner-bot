export class CredentialsQueries {
	static apiId(userId: number): string {
		return `SELECT api_id FROM telegram_client_redentials WHERE user_id = ${userId}`
	}

	static saveApiId(userId: number, apiId: number): string {
		return `
		INSERT INTO 
      telegram_client_redentials (
        user_id, 
        api_id
    	) 
		SELECT 
			${userId}, 
    	${apiId}
		WHERE NOT EXISTS (
      SELECT user_id 
      FROM telegram_client_redentials
      WHERE user_id = ${userId}
		); 
		UPDATE telegram_client_redentials 
		SET api_id = ${apiId} 
		WHERE user_id = ${userId}
		`
	}

	static apiHash(userId: number): string {
		return `SELECT api_hash FROM telegram_client_redentials WHERE user_id = ${userId}`
	}

	static saveApiHash(userId: number, apiHash: string): string {
		return `
		INSERT INTO 
      telegram_client_redentials (
        user_id, 
        api_hash
    	) 
		SELECT 
			${userId}, 
    	'${apiHash}'
		WHERE NOT EXISTS (
      SELECT user_id 
      FROM telegram_client_redentials
      WHERE user_id = ${userId}
		); 
		UPDATE telegram_client_redentials 
		SET api_hash = '${apiHash}' 
		WHERE user_id = ${userId}
		`
	}

	static session(userId: number): string {
		return `SELECT session FROM telegram_client_redentials WHERE user_id = ${userId}`
	}

	static saveSession(userId: number, session: string): string {
		return `
		INSERT INTO 
      telegram_client_redentials (
        user_id, 
        session
    	) 
		SELECT 
			${userId}, 
    	'${session}'
		WHERE NOT EXISTS (
      SELECT user_id 
      FROM telegram_client_redentials
      WHERE user_id = ${userId}
		); 
		UPDATE telegram_client_redentials 
		SET session = '${session}' 
		WHERE user_id = ${userId}
		`
	}
}
