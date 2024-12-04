import * as vscode from 'vscode';
import { BaseAIProvider } from './BaseAIProvider';
import { HuggingFaceProvider } from './implementations/HuggingFaceProvider';
import { OpenAIProvider } from './implementations/OpenAIProvider';
import { AnthropicProvider } from './implementations/AnthropicProvider';
import { GoogleAIProvider } from './implementations/GoogleAIProvider';

export class AIProviderManager {
    private providers: Map<string, BaseAIProvider>;
    private context: vscode.ExtensionContext;
    private providerFailures: Map<string, number>;
    private lastCallTime: Map<string, number>;
    private readonly RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
    private readonly MAX_RETRIES = 3;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.providers = new Map();
        this.providerFailures = new Map();
        this.lastCallTime = new Map();
        this.initializeProviders();
    }

    private initializeProviders() {
        this.providers.set('huggingface', new HuggingFaceProvider());
        this.providers.set('openai', new OpenAIProvider());
        this.providers.set('anthropic', new AnthropicProvider());
        this.providers.set('google', new GoogleAIProvider());
    }

    private isRateLimited(providerName: string): boolean {
        const lastCall = this.lastCallTime.get(providerName);
        if (!lastCall) return false;

        const timeSinceLastCall = Date.now() - lastCall;
        return timeSinceLastCall < this.RATE_LIMIT_WINDOW;
    }

    private async tryNextProvider(currentProvider: string): Promise<BaseAIProvider | null> {
        const providers = Array.from(this.providers.keys());
        const currentIndex = providers.indexOf(currentProvider);

        for (let i = 1; i <= providers.length - 1; i++) {
            const nextIndex = (currentIndex + i) % providers.length;
            const nextProvider = providers[nextIndex];

            if (!this.isRateLimited(nextProvider)) {
                const provider = this.providers.get(nextProvider)!;
                const apiKey = await this.context.secrets.get(`${provider.getName()}_api_key`);
                if (apiKey) {
                    return provider;
                }
            }
        }

        return null;
    }

    public async getCurrentProvider(): Promise<BaseAIProvider> {
        try {
            const config = vscode.workspace.getConfiguration('aiArchitect');
            let defaultProvider = config.get<string>('defaultProvider') || 'huggingface';

            // Check if current provider is rate limited
            if (this.isRateLimited(defaultProvider)) {
                vscode.window.showWarningMessage(`${defaultProvider} is rate limited. Trying another provider...`);
                const nextProvider = await this.tryNextProvider(defaultProvider);
                if (nextProvider) {
                    defaultProvider = nextProvider.getName();
                } else {
                    throw new Error('All providers are rate limited or unconfigured');
                }
            }

            if (!this.providers.has(defaultProvider)) {
                vscode.window.showWarningMessage(`Provider "${defaultProvider}" not found. Using HuggingFace as fallback.`);
                return this.providers.get('huggingface')!;
            }

            const provider = this.providers.get(defaultProvider)!;
            const apiKey = await this.context.secrets.get(`${provider.getName()}_api_key`);

            if (!apiKey) {
                throw new Error(`API key not configured for ${provider.getName()}`);
            }

            // Update last call time
            this.lastCallTime.set(defaultProvider, Date.now());
            return provider;

        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(error.message);
            }
            return this.providers.get('huggingface')!;
        }
    }

    public async showConfigurationUI() {
        try {
            // Show dropdown to select provider
            const providerNames = Array.from(this.providers.keys());
            const selectedProvider = await vscode.window.showQuickPick(providerNames, {
                placeHolder: 'Select AI provider to configure'
            });

            if (!selectedProvider) return;

            const provider = this.providers.get(selectedProvider)!;
            const apiKey = await vscode.window.showInputBox({
                prompt: `Enter API key for ${provider.getName()}`,
                password: true,
                ignoreFocusOut: true
            });

            if (apiKey) {
                await this.context.secrets.store(`${provider.getName()}_api_key`, apiKey);
                vscode.window.showInformationMessage(`API key for ${provider.getName()} has been saved`);
            }
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Configuration failed: ${error.message}`);
            }
        }
    }
}