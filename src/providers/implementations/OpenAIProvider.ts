import axios from 'axios';
import { BaseAIProvider } from '../BaseAIProvider';

export class OpenAIProvider implements BaseAIProvider {
    getName(): string {
        return 'openai';
    }

    getBaseUrl(): string {
        return 'https://api.openai.com/v1';
    }

    async callAPI(input: string, options?: object): Promise<string> {
        try {
            // Fetch API key from environment variable
            const apiKey = process.env.OPENAI_API_KEY;

            if (!apiKey) {
                throw new Error('OpenAI API key not configured in .env file.');
            }

            const response = await axios.post(
                `${this.getBaseUrl()}/chat/completions`,
                {
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: input }],
                    ...options
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error('OpenAI API Error:', error.message || error);
            throw new Error('Failed to get response from OpenAI.');
        }
    }
}
