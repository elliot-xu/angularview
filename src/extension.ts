import * as vscode from 'vscode';
import { AngularViewDataProvider } from './angularView';

export function activate(context: vscode.ExtensionContext){
    console.log("myextension is now activate");
    const rootPath = vscode.workspace.rootPath;

    var viewDataProvider = new AngularViewDataProvider(rootPath);
    vscode.window.registerTreeDataProvider('angularView', viewDataProvider);

    vscode.commands.registerCommand('angularView.ShowWorkUnit', () => {
        vscode.window.showInformationMessage('Start loading...');
    });

    vscode.commands.registerCommand('angularView.RefreshWorkUnit', () => {
        viewDataProvider.fresh();
    });

    vscode.commands.registerCommand('openWorkFile', (filePath: string) => {
        vscode.workspace.openTextDocument(filePath)
            .then( doc => vscode.window.showTextDocument(doc));
    });
}