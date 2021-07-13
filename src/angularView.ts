import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';

export class AngularViewDataProvider implements vscode.TreeDataProvider<AngularWorkUnit> {

    private readonly pattern: string = '.component.ts';
    private readonly angular_json: string = 'angular.json';

    constructor(
        private rootPath: string
    ) { }

    _onDidChangeTreeData: vscode.EventEmitter<AngularWorkUnit | undefined> = 
        new vscode.EventEmitter<AngularWorkUnit | undefined>();
    onDidChangeTreeData: vscode.Event<AngularWorkUnit | undefined> = 
        this._onDidChangeTreeData.event;
    fresh() {
        // TODO
        throw Error();
    }
    getTreeItem(element: AngularWorkUnit): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: AngularWorkUnit): Thenable<AngularWorkUnit[]> {
        // TODO
        throw Error();
    }

    private pathExist(p: string) {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }
    
        return true;
    }
}

class AngularWorkUnit extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly fullPath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }
}