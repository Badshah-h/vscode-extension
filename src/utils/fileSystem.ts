import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileSystemManager {
    /**
     * Create a new file with content
     */
    static async createFile(filePath: string, content: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(filePath);
            const dirname = path.dirname(filePath);
            
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true });
            }
            
            const encodedContent = Buffer.from(content, 'utf8');
            await vscode.workspace.fs.writeFile(uri, encodedContent);
        } catch (error) {
            console.error('Error creating file:', error);
            throw new Error(`Failed to create file: ${filePath}`);
        }
    }

    /**
     * Read file content
     */
    static async readFile(filePath: string): Promise<string> {
        try {
            const uri = vscode.Uri.file(filePath);
            const content = await vscode.workspace.fs.readFile(uri);
            return Buffer.from(content).toString('utf8');
        } catch (error) {
            console.error('Error reading file:', error);
            throw new Error(`Failed to read file: ${filePath}`);
        }
    }

    /**
     * Delete a file
     */
    static async deleteFile(filePath: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.delete(uri);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error(`Failed to delete file: ${filePath}`);
        }
    }

    /**
     * Create a directory
     */
    static async createDirectory(dirPath: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(dirPath);
            await vscode.workspace.fs.createDirectory(uri);
        } catch (error) {
            console.error('Error creating directory:', error);
            throw new Error(`Failed to create directory: ${dirPath}`);
        }
    }
}