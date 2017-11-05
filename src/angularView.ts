import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';

export class AngularViewDataProvider implements vscode.TreeDataProvider<AngularWorkUnit> {

    private readonly pattern: string = '.component.ts';
    constructor(
        private rootPath: string
    ) { }

    _onDidChangeTreeData: vscode.EventEmitter<AngularWorkUnit | undefined> = 
        new vscode.EventEmitter<AngularWorkUnit | undefined>();
    onDidChangeTreeData: vscode.Event<AngularWorkUnit | undefined> = 
        this._onDidChangeTreeData.event;
    fresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element: AngularWorkUnit): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: AngularWorkUnit): Thenable<AngularWorkUnit[]> {
        return new Promise(resolve => {
            if (element) {
                resolve(this.getHtmlAndCss(element));
            } else {
                resolve(
                    glob.sync(`${this.rootPath}/**/*${this.pattern}`)
                        .map(fullPath => new AngularWorkUnit(
                            path.basename(fullPath),
                            fullPath,
                            vscode.TreeItemCollapsibleState.Collapsed)
                        ));
            }
        });
    }

    private getHtmlAndCss(workUnit: AngularWorkUnit): AngularWorkUnit[] {
        const dirPath = path.dirname(workUnit.fullPath);
        const filter = workUnit.label
            .substring(0, workUnit.label.length - this.pattern.length);

        return glob.sync(`${dirPath}/${filter}**`)
            .map(file => new AngularWorkUnit(
                path.basename(file),
                file,
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'openWorkFile',
                    title: '',
                    arguments: [file]
                }));
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