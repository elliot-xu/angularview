import * as path from 'path';
import * as vscode from 'vscode';
import * as glob from 'glob';
import { AstParser } from './ast-parser';
import * as fs from 'fs';

const PATTERN: string = '.component.ts';

export class AngularViewDataProvider implements vscode.TreeDataProvider<AngularWorkUnit> {

    private readonly parser: AstParser = new AstParser();
    private searchPattern: string;

    constructor(rootPath: string) { 
        this.searchPattern = `${rootPath}/**/*${PATTERN}`;
    }

    _onDidChangeTreeData: vscode.EventEmitter<AngularWorkUnit | undefined> = new vscode.EventEmitter<AngularWorkUnit | undefined>();
    onDidChangeTreeData: vscode.Event<AngularWorkUnit | undefined> = this._onDidChangeTreeData.event;

    fresh(element?: AngularWorkUnit) {
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: AngularWorkUnit): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: AngularWorkUnit): Thenable<AngularWorkUnit[]> {
        return new Promise(resolve => {
            if (element) {
                resolve(this.getChildrenWorkUnit(element));
            } else {
                resolve(
                    glob.sync(this.searchPattern)
                        .map(fullPath => this.getBaseWorkUnit(fullPath))
                );
            }
        });
    }

    private getBaseWorkUnit(fullPath: string): AngularWorkUnit {
        const dirPath = path.dirname(fullPath);
        const basename = path.basename(fullPath);
        const metaData = this.parser.extract(basename, fs.readFileSync(fullPath).toString());

        const getfullPath = (x: string) => path.join(dirPath, x);

        if (!metaData) {
            return new AngularWorkUnit(
                basename,
                fullPath,
                vscode.TreeItemCollapsibleState.None
            );
        }

        let workUnit = new AngularWorkUnit(
            metaData.selector,
            fullPath,
            vscode.TreeItemCollapsibleState.Collapsed
        );

        workUnit.children.push(fullPath);

        if (metaData?.templateUrl) {
            workUnit.children.push(getfullPath(metaData.templateUrl));
        }

        if (metaData?.styleUrls) {
            metaData.styleUrls.forEach((v, i) => workUnit.children.push(getfullPath(v)));
        }

        return workUnit;
    }

    private getChildrenWorkUnit(baseUnit: AngularWorkUnit): AngularWorkUnit[] {
        return baseUnit.children.map(fullpath => new AngularWorkUnit(
            path.basename(fullpath),
            fullpath,
            vscode.TreeItemCollapsibleState.None,
            {
                command: 'openWorkFile',
                title: 'open',
                arguments: [fullpath]
            }
        ));
    }
}

class AngularWorkUnit extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly fullPath: string,
        public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(vscode.Uri.parse(fullPath), collapsibleState);
        this.dirPath = path.dirname(fullPath);
    }

    dirPath: string;
    children: string[] = [];
}