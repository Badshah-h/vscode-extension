import axios from 'axios';
import { BaseAIProvider } from '../BaseAIProvider';

export class AnthropicProvider implements BaseAIProvider {
    async callAPI(input: string, options?: object): Promise<string> {
        try {
            // Retrieve the Anthropic API key from environment variables
            const apiKey = process.env.ANTHROPIC_API_KEY;

            if (!apiKey) {
                throw new Error(
                    'Anthropic API key not configured in environment variables. Please set ANTHROPIC_API_KEY in your .env file.'
                );
            }

            if (!input || input.trim().length === 0) {
                throw new Error('Input prompt cannot be empty.');
            }

            const response = await axios.post(
                `${this.getBaseUrl()}/messages`,
                {
                    model: 'claude-3-opus-20240229',
                    messages: [{ role: 'user', content: input }],
                    ...options
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'Anthropic-Version': '2023-06-01'
                    }
                }
            );

            if (!response.data || !response.data.content || response.data.content.length === 0) {
                throw new Error('Anthropic API returned an invalid response.');
            }

            return response.data.content[0].text;
        } catch (error: any) {
            console.error('Anthropic API Error:', error.message || error);
            throw new Error(
                'Failed to get a response from Anthropic. Please check your API key and network connection.'
            );
        }
    }

    getBaseUrl(): string {
        return 'https://api.anthropic.com/v1';
    }

    getName(): string {
        return 'anthropic';
    }
}
