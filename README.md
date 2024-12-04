# AI Architect - VS Code Extension

AI Architect is a powerful VS Code extension that provides multi-model AI assistance for developers. It supports multiple AI providers and offers advanced features for code generation, explanation, and project management.

![AI Architect Demo](https://raw.githubusercontent.com/yourusername/ai-architect/main/media/demo.gif)

## Features

- 🤖 Multi-Model AI Support
  - OpenAI (GPT-3.5, GPT-4)
  - Anthropic (Claude)
  - Google (PaLM 2)
  - Hugging Face
  - And more...

- 💻 Advanced Coding Assistance
  - Code explanation
  - Refactoring suggestions
  - Bug detection
  - Best practices recommendations

- 📁 Project Management
  - Project scaffolding
  - File operations
  - Dependency management

## Installation

1. Download the `.vsix` file from the [latest release](https://marketplace.visualstudio.com/items?itemName=yourusername.ai-architect)

2. Install using VS Code:
   - Open VS Code
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
   - Type "Install from VSIX"
   - Select the downloaded `.vsix` file

Alternatively, install directly from VS Code Marketplace:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "AI Architect"
4. Click Install

## Configuration

1. Configure your preferred AI provider:
   - Open Command Palette (Ctrl+Shift+P)
   - Type "AI Architect: Configure AI Providers"
   - Enter your API key when prompted

2. Available settings:
   ```json
   {
     "aiArchitect.defaultProvider": "openai",
     "aiArchitect.model": "gpt-4"
   }
   ```

## Usage

1. Open AI Chat:
   - Click the AI Architect icon in the activity bar
   - Or use Command Palette: "AI Architect: Start Chat"

2. Common Commands:
   - Ask coding questions
   - Request code explanations
   - Generate code snippets
   - Get refactoring suggestions

## Development

### Prerequisites

- Node.js 16.x or higher
- VS Code

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-architect.git
   cd ai-architect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open in VS Code:
   ```bash
   code .
   ```

### Project Structure

```
ai-architect/
├── src/
│   ├── extension.ts           # Extension entry point
│   ├── providers/            # AI provider implementations
│   │   ├── BaseAIProvider.ts
│   │   ├── AIProviderManager.ts
│   │   ├── ChatProvider.ts
│   │   └── implementations/
│   │       ├── OpenAIProvider.ts
│   │       ├── AnthropicProvider.ts
│   │       └── ...
│   ├── webview/             # UI components
│   │   └── ChatViewProvider.ts
│   └── utils/              # Utility functions
│       ├── fileSystem.ts
│       └── formatting.ts
├── media/                  # Icons and images
│   └── icon.svg
├── package.json           # Extension manifest
├── webpack.config.js      # Build configuration
└── tsconfig.json         # TypeScript configuration
```

### Building

1. Development build:
   ```bash
   npm run compile
   ```

2. Production build:
   ```bash
   npm run package
   ```

### Testing

Run tests:
```bash
npm test
```

### Publishing

1. Package the extension:
   ```bash
   vsce package
   ```

2. Upload to VS Code Marketplace through [Azure DevOps](https://marketplace.visualstudio.com/manage)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details