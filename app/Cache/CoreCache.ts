export class CoreCache {
	private inMemoryStorage: { [key: string]: any } = {}

	static shared = new CoreCache()

	private constructor() {}

	set(value: any, key: string) {
		this.inMemoryStorage[key] = value
	}

	get<T>(key: string): T | undefined {
		return this.inMemoryStorage[key] as T
	}
}
