import { AIProviderManager } from './AIProviderManager';

export class ChatProvider {
    private aiProviderManager: AIProviderManager;
    private conversationHistory: Array<{ role: string; content: string }> = [];

    constructor(aiProviderManager: AIProviderManager) {
        this.aiProviderManager = aiProviderManager;
    }

    async sendMessage(message: string): Promise<string> {
        // Add user message to history
        this.conversationHistory.push({ role: 'user', content: message });

        try {
            const provider = await this.aiProviderManager.getCurrentProvider();
            const response = await provider.callAPI(message, {
                history: this.conversationHistory
            });

            // Add AI response to history
            this.conversationHistory.push({ role: 'assistant', content: response });

            return response;
        } catch (error) {
            console.error('Error in chat provider:', error);
            throw new Error('Failed to get response from AI provider');
        }
    }

    clearHistory(): void {
        this.conversationHistory = [];
    }

    getHistory(): Array<{ role: string; content: string }> {
        return [...this.conversationHistory];
    }
}