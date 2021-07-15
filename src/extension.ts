import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AngularViewDataProvider } from './angular-view-provider';

const ANGULAR_JSON: string = 'angular.json';

export function activate(context: vscode.ExtensionContext) {
    if (vscode.workspace.workspaceFolders) {
        for (const workspace of vscode.workspace.workspaceFolders) {
            const filePath = workspace.uri.fsPath;
            if (pathExist(path.join(filePath, ANGULAR_JSON))) {
                var viewDataProvider = new AngularViewDataProvider(filePath);
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
                break;
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