import * as ts from "typescript";

export class AstParser {
    constructor() {
    }

    extract(fileName: string, fileContent: string): ComponentDecorator | undefined {
        const sourceFile = ts.createSourceFile(
            fileName,
            fileContent,
            ts.ScriptTarget.ES2015,
            /*setParentNodes */ true
        );

        let metadata: any = {};

        this.traversal(sourceFile, metadata);
        return metadata.selector ? metadata : undefined;
    }

    private traversal(sourceFile: ts.SourceFile, metadata: ComponentDecorator) {
        traversalNode(sourceFile, metadata);

        function parseArgument(nodes: ts.NodeArray<ts.Expression>, metadata: ComponentDecorator) {
            if (nodes.length === 1) {
                const node = nodes[0];
                traversalObjLiteral(node, metadata);
            }
            return null;
        }

        function traversalObjLiteral(node: ts.Node, metadata: any) {
            switch (node.kind) {
                case ts.SyntaxKind.PropertyAssignment:
                    const ps = node as ts.PropertyAssignment;
                    const psname = ps.name as ts.Identifier;

                    if (psname.text === 'selector' || psname.text === 'templateUrl') {
                        const psStringLiteral = ps.initializer as ts.StringLiteral;
                        metadata[psname.text] = psStringLiteral.text;
                    }
                    else if (psname.text === 'styleUrls') {
                        metadata[psname.text] = [];
                        for (const ele of (ps.initializer as ts.ArrayLiteralExpression).elements) {
                            metadata[psname.text].push((ele as ts.StringLiteral).text);
                        }
                    }

                    break;
                default:
                    break;
            }
            ts.forEachChild(node, (n) => traversalObjLiteral(n, metadata));
        }

        function traversalNode(node: ts.Node, metadata: ComponentDecorator) {
            switch (node.kind) {
                case ts.SyntaxKind.Decorator:
                    const callExp = (node as ts.Decorator).expression as ts.CallExpression;
                    const identifier = callExp.expression as ts.Identifier;
                    if (identifier.escapedText === 'Component') {
                        parseArgument(callExp.arguments, metadata);
                    }
                    break;
                default:
                    break;
            }
            ts.forEachChild(node, (n) => traversalNode(n, metadata));
        }
    }

    private readonly printHelper = (sourceFile: ts.SourceFile) => {
        const p = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        return (node: ts.Node) => {
            return p.printNode(ts.EmitHint.Unspecified, node, sourceFile);
        }
    }
}

export interface ComponentDecorator {
    selector: string,
    templateUrl?: string,
    styleUrls?: string[]
}
