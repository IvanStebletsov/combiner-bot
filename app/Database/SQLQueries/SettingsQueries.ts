export class SettingsQueries {
	static saveLanguageCode(userId: number, languageCode: string, projectName: string): string {
		return `
		INSERT INTO 
    	${projectName}_settings (
        user_id, 
        language_code
    	) 
		SELECT 
			${userId}, 
    	'${languageCode}' 
		WHERE NOT EXISTS (
      SELECT user_id 
      FROM ${projectName}_settings 
      WHERE user_id = ${userId}
		); 
		UPDATE ${projectName}_settings 
		SET language_code = '${languageCode}' 
		WHERE user_id = ${userId}
		`
	}

	static languageCode(userId: number, projectName: string): string {
		return `SELECT language_code FROM ${projectName}_settings WHERE user_id = ${userId}`
	}
}
