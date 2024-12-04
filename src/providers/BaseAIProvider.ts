export interface BaseAIProvider {
    getName(): string;
    getBaseUrl(): string;
    callAPI(input: string, options?: object): Promise<string>;
}