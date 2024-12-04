import * as vscode from 'vscode';
import { ChatProvider } from '../providers/ChatProvider';
import { FileSystemManager } from '../utils/fileSystem';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private view?: vscode.WebviewView;
    private chatProvider: ChatProvider;

    constructor(
        private readonly context: vscode.ExtensionContext,
        chatProvider: ChatProvider
    ) {
        this.chatProvider = chatProvider;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        this.setupMessageHandlers(webviewView);
    }

    private setupMessageHandlers(webviewView: vscode.WebviewView) {
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    try {
                        const response = await this.chatProvider.sendMessage(data.message);
                        webviewView.webview.postMessage({
                            type: 'response',
                            message: response
                        });
                    } catch (error) {
                        webviewView.webview.postMessage({
                            type: 'error',
                            message: 'Failed to get AI response'
                        });
                    }
                    break;

                case 'executeCommand':
                    try {
                        const terminal = vscode.window.createTerminal('AI Architect');
                        terminal.show();
                        terminal.sendText(data.command);
                    } catch (error) {
                        webviewView.webview.postMessage({
                            type: 'error',
                            message: 'Failed to execute command'
                        });
                    }
                    break;

                case 'analyzeFile':
                    try {
                        const fileContent = await FileSystemManager.readFile(data.filePath);
                        const analysis = await this.chatProvider.sendMessage(
                            `Analyze this code:\n\n${fileContent}`
                        );
                        webviewView.webview.postMessage({
                            type: 'fileAnalysis',
                            analysis
                        });
                    } catch (error) {
                        webviewView.webview.postMessage({
                            type: 'error',
                            message: 'Failed to analyze file'
                        });
                    }
                    break;
            }
        });
    }

    private getHtmlContent(webview: vscode.Webview): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Architect Chat</title>
                <style>
                    body { 
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .tabs {
                        display: flex;
                        background: var(--vscode-editor-background);
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding: 5px 5px 0 5px;
                    }
                    .tab {
                        padding: 8px 16px;
                        cursor: pointer;
                        border: 1px solid transparent;
                        border-bottom: none;
                        margin-right: 4px;
                        border-radius: 4px 4px 0 0;
                        background: var(--vscode-editor-background);
                        color: var(--vscode-foreground);
                    }
                    .tab.active {
                        background: var(--vscode-editor-selectionBackground);
                        border-color: var(--vscode-panel-border);
                    }
                    .tab-content {
                        display: none;
                        flex: 1;
                        overflow: auto;
                        padding: 10px;
                    }
                    .tab-content.active {
                        display: flex;
                        flex-direction: column;
                    }
                    #chat-container { 
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                    }
                    #messages {
                        flex: 1;
                        overflow-y: auto;
                        margin-bottom: 10px;
                        padding: 10px;
                    }
                    .message {
                        margin: 5px 0;
                        padding: 8px;
                        border-radius: 4px;
                        max-width: 85%;
                    }
                    .user-message {
                        background-color: var(--vscode-editor-selectionBackground);
                        align-self: flex-end;
                    }
                    .ai-message {
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        align-self: flex-start;
                    }
                    .suggested-command {
                        cursor: pointer;
                        padding: 4px 8px;
                        margin: 2px 0;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 2px;
                    }
                    .suggested-command:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    #input-container {
                        display: flex;
                        gap: 8px;
                        padding: 10px;
                        background: var(--vscode-editor-background);
                        border-top: 1px solid var(--vscode-panel-border);
                    }
                    #message-input {
                        flex: 1;
                        padding: 8px;
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 2px;
                    }
                    #send-button {
                        padding: 8px 16px;
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        cursor: pointer;
                        border-radius: 2px;
                    }
                    #send-button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                    .file-drop-zone {
                        border: 2px dashed var(--vscode-panel-border);
                        padding: 20px;
                        text-align: center;
                        margin: 10px;
                        border-radius: 4px;
                    }
                    .file-drop-zone.drag-over {
                        background: var(--vscode-editor-selectionBackground);
                    }
                </style>
            </head>
            <body>
                <div class="tabs">
                    <div class="tab active" data-tab="chat">Chat</div>
                    <div class="tab" data-tab="files">Files</div>
                    <div class="tab" data-tab="refactor">Refactor</div>
                </div>

                <div class="tab-content active" data-tab="chat">
                    <div id="chat-container">
                        <div id="messages"></div>
                        <div id="input-container">
                            <input type="text" id="message-input" placeholder="Type your message...">
                            <button id="send-button">Send</button>
                        </div>
                    </div>
                </div>

                <div class="tab-content" data-tab="files">
                    <div class="file-drop-zone">
                        Drop files here for AI analysis
                    </div>
                    <div id="file-analysis"></div>
                </div>

                <div class="tab-content" data-tab="refactor">
                    <div id="refactor-suggestions"></div>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    const messagesContainer = document.getElementById('messages');
                    const messageInput = document.getElementById('message-input');
                    const sendButton = document.getElementById('send-button');
                    const fileDropZone = document.querySelector('.file-drop-zone');
                    const tabs = document.querySelectorAll('.tab');
                    const tabContents = document.querySelectorAll('.tab-content');

                    // Tab switching
                    tabs.forEach(tab => {
                        tab.addEventListener('click', () => {
                            const tabName = tab.dataset.tab;
                            tabs.forEach(t => t.classList.remove('active'));
                            tabContents.forEach(c => c.classList.remove('active'));
                            tab.classList.add('active');
                            document.querySelector(\`.tab-content[data-tab="\${tabName}"]\`).classList.add('active');
                        });
                    });

                    // Chat functionality
                    function addMessage(content, isUser) {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = \`message \${isUser ? 'user-message' : 'ai-message'}\`;
                        messageDiv.textContent = content;
                        messagesContainer.appendChild(messageDiv);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }

                    function addSuggestedCommand(command) {
                        const cmdButton = document.createElement('button');
                        cmdButton.className = 'suggested-command';
                        cmdButton.textContent = \`Run: \${command}\`;
                        cmdButton.onclick = () => {
                            vscode.postMessage({
                                type: 'executeCommand',
                                command: command
                            });
                        };
                        messagesContainer.appendChild(cmdButton);
                    }

                    function sendMessage() {
                        const message = messageInput.value.trim();
                        if (message) {
                            addMessage(message, true);
                            vscode.postMessage({
                                type: 'sendMessage',
                                message: message
                            });
                            messageInput.value = '';
                        }
                    }

                    sendButton.onclick = sendMessage;
                    messageInput.onkeypress = (e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    };

                    // File drop functionality
                    fileDropZone.ondragover = (e) => {
                        e.preventDefault();
                        fileDropZone.classList.add('drag-over');
                    };

                    fileDropZone.ondragleave = () => {
                        fileDropZone.classList.remove('drag-over');
                    };

                    fileDropZone.ondrop = (e) => {
                        e.preventDefault();
                        fileDropZone.classList.remove('drag-over');
                        const files = Array.from(e.dataTransfer.files);
                        vscode.postMessage({
                            type: 'analyzeFiles',
                            files: files.map(f => f.path)
                        });
                    };

                    // Handle messages from extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'response':
                                addMessage(message.content, false);
                                if (message.suggestedCommands) {
                                    message.suggestedCommands.forEach(addSuggestedCommand);
                                }
                                break;
                            case 'error':
                                addMessage('Error: ' + message.message, false);
                                break;
                            case 'fileAnalysis':
                                document.getElementById('file-analysis').innerHTML = message.analysis;
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}