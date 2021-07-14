import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import { AstParser } from './ast-parser';

export class AngularViewDataProvider implements vscode.TreeDataProvider<AngularWorkUnit> {

    private readonly pattern: string = '.component.ts';
    private readonly angular_json: string = 'angular.json';
    private readonly parser: AstParser = new AstParser();

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
                        )
                );
            }
        });
    }

    private getHtmlAndCss(workUnit: AngularWorkUnit): AngularWorkUnit[] {
        const metaData = this.parser.extract(workUnit.label, 
                fs.readFileSync(workUnit.fullPath).toString());
        const dirPath = path.dirname(workUnit.fullPath);
        const fullPath = (x: string) => path.join(dirPath, x);
        const children: string[] = [];
        
        if(metaData?.templateUrl) {
            children.push(fullPath(metaData.templateUrl));
        }

        if(metaData?.styleUrls) {
            metaData.styleUrls.forEach((v, i) => children.push(fullPath(v)));
        }

        return children.map(fullpath => new AngularWorkUnit(
            path.basename(fullpath),
            fullpath,
            vscode.TreeItemCollapsibleState.None,
            {
                command: 'openWorkFile',
                title: '',
                arguments: [fullpath]
            }
        ));
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