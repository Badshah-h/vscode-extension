import * as vscode from 'vscode';

export class CodeFormatter {
    /**
     * Format code according to language
     */
    static async formatCode(code: string, language: string): Promise<string> {
        try {
            const doc = await vscode.workspace.openTextDocument({
                content: code,
                language
            });
            
            const formatted = await vscode.commands.executeCommand(
                'vscode.executeFormatDocumentProvider',
                doc.uri
            ) as vscode.TextEdit[];

            return formatted ? this.applyEdits(doc, formatted) : code;
        } catch (error) {
            console.error('Error formatting code:', error);
            return code;
        }
    }

    /**
     * Apply text edits to document
     */
    private static applyEdits(doc: vscode.TextDocument, edits: vscode.TextEdit[]): string {
        const lines = doc.getText().split('\n');
        
        // Apply edits in reverse order to maintain validity of positions
        edits.sort((a, b) => b.range.start.line - a.range.start.line);
        
        for (const edit of edits) {
            const { start, end } = edit.range;
            const startLine = start.line;
            const endLine = end.line;
            
            // Replace the affected lines
            lines.splice(
                startLine,
                endLine - startLine + 1,
                edit.newText
            );
        }
        
        return lines.join('\n');
    }

    /**
     * Indent code block
     */
    static indentCode(code: string, spaces: number = 4): string {
        const indent = ' '.repeat(spaces);
        return code.split('\n')
            .map(line => line.trim() ? indent + line : line)
            .join('\n');
    }
}