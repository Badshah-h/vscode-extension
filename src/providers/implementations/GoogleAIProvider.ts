import axios from 'axios';
import { BaseAIProvider } from '../BaseAIProvider';

interface GoogleAIOptions {
    temperature?: number; // Adjusts randomness of responses (0.0 to 1.0)
    maxTokens?: number; // Limits the number of tokens in the response
    topP?: number; // Nucleus sampling parameter (0.0 to 1.0)
}

export class GoogleAIProvider implements BaseAIProvider {
    getName(): string {
        return 'google';
    }

    getBaseUrl(): string {
        return 'https://generativelanguage.googleapis.com/v1beta2';
    }

    async callAPI(input: string, options?: GoogleAIOptions): Promise<string> {
        try {
            // Retrieve the Google AI API key from environment variables
            const apiKey = process.env.GOOGLE_AI_API_KEY;

            if (!apiKey) {
                throw new Error('Google AI API key not configured in environment variables. Please set GOOGLE_AI_API_KEY in your .env file.');
            }

            if (!input || input.trim().length === 0) {
                throw new Error('Input prompt cannot be empty.');
            }

            // Prepare the request body
            const requestBody = {
                prompt: {
                    text: input,
                },
                ...options,
            };

            // Make the API call using axios
            const response = await axios.post(
                `${this.getBaseUrl()}/models/chat:generateText`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                }
            );

            // Validate the response and return the result
            if (!response.data.candidates || response.data.candidates.length === 0) {
                throw new Error('No candidates returned from the Google AI API.');
            }

            return response.data.candidates[0].output || 'No output generated.';
        } catch (error: any) {
            console.error('Google AI API Error:', error.message || error);
            throw new Error('Failed to get a response from Google AI. Please check your API key and network connection.');
        }
    }

    async generateText(prompt: string, options?: GoogleAIOptions): Promise<string> {
        try {
            return await this.callAPI(prompt, options);
        } catch (error) {
            console.error('Error in GoogleAIProvider.generateText:', error);
            throw error;
        }
    }
}
