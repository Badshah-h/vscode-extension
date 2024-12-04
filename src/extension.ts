import * as vscode from 'vscode';
import { ChatProvider } from './providers/ChatProvider';
import { AIProviderManager } from './providers/AIProviderManager';
import { ChatViewProvider } from './webview/ChatViewProvider';

export function activate(context: vscode.ExtensionContext) {
    const aiProviderManager = new AIProviderManager(context);
    const chatProvider = new ChatProvider(aiProviderManager);
    const chatViewProvider = new ChatViewProvider(context, chatProvider);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'aiArchitect.chatView',
            chatViewProvider
        ),
        vscode.commands.registerCommand('aiArchitect.startChat', () => {
            vscode.commands.executeCommand('workbench.view.extension.aiArchitect');
        }),
        vscode.commands.registerCommand('aiArchitect.configureProviders', () => {
            aiProviderManager.showConfigurationUI();
        })
    );
}

export function deactivate() {
    // Add any cleanup or disposal logic here
}