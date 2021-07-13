import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AngularViewDataProvider } from './angularView';

export function activate(context: vscode.ExtensionContext) {
    console.log("myextension is now activate");
    const ws_folders = vscode.workspace.workspaceFolders;
    const angular_json: string = 'angular.json';

    if (ws_folders) {
        for (const folder of ws_folders) {
            if (pathExist(path.join(folder.name, angular_json))) {
                var viewDataProvider = new AngularViewDataProvider(folder.name);
                vscode.window.registerTreeDataProvider('angularView', viewDataProvider);

                vscode.commands.registerCommand('angularView.ShowWorkUnit', () => {
                    vscode.window.showInformationMessage('Start loading...');
                });

                vscode.commands.registerCommand('angularView.RefreshWorkUnit', () => {
                    viewDataProvider.fresh();
                });

                vscode.commands.registerCommand('openWorkFile', (filePath: string) => {
                    vscode.workspace.openTextDocument(filePath)
                        .then(doc => vscode.window.showTextDocument(doc));
                });
            }
        }
    }
}

function pathExist(p: string) {
    try {
        fs.accessSync(p);
    } catch (err) {
        return false;
    }

    return true;
}