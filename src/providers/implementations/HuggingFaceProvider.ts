import axios from 'axios';
import { BaseAIProvider } from '../BaseAIProvider';

export class HuggingFaceProvider implements BaseAIProvider {
    getName(): string {
        return 'huggingface';
    }

    getBaseUrl(): string {
        return 'https://api-inference.huggingface.co';
    }

    async callAPI(input: string, options?: object): Promise<string> {
        try {
            // Retrieve the Hugging Face API key from environment variables
            const apiKey = process.env.HUGGINGFACE_API_KEY;

            if (!apiKey) {
                throw new Error(
                    'Hugging Face API key not configured in environment variables. Please set HUGGINGFACE_API_KEY in your .env file.'
                );
            }

            // Specify the Qwen model to use
            const model = 'Qwen/Qwen2.5-Coder-32B-Instruct';

            // Make the API call
            const response = await axios.post(
                `${this.getBaseUrl()}/models/${model}`,
                {
                    inputs: input,
                    ...options,
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Validate the response and return the result
            if (!response.data || !response.data.generated_text) {
                throw new Error('Hugging Face API returned an invalid response.');
            }

            return response.data.generated_text;
        } catch (error: any) {
            console.error('Hugging Face API Error:', error.message || error);
            throw new Error(
                'Failed to get a response from Hugging Face. Please check your API key and network connection.'
            );
        }
    }
}
