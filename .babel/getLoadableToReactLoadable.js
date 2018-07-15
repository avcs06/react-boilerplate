module.exports.__esModule = true;
const syntax = require('babel-plugin-syntax-dynamic-import');

let localVariableName;
module.exports.default = function({ types: t }) {
    return {
        inherits: syntax,
        visitor: {
            Program: {
                enter: function enter() {
                    localVariableName = null;
                }
            },
            ImportDeclaration: function ImportDeclaration(path, state) {
                if (!/getLoadableComponent/.test(path.node.source.value)) return;

                const defaultSpecifier = path.get('specifiers').find(specifier => specifier.isImportDefaultSpecifier());
                if (!defaultSpecifier) return;

                localVariableName = defaultSpecifier.node.local.name;
            }, 
            CallExpression: function CallExpression(path, state) {
                if (!localVariableName || path.__processed) return;

                const { node } = path;
                if (t.isIdentifier(node.callee, { name: localVariableName })) {
                    const args = path.get('arguments');
                    if (args.length !== 1) throw path.error;

                    const loader = args[0];
                    const importPath = path.node.arguments[0];
                    const importPathPure = t.stringLiteral(importPath.value.replace(/^!/, ''));
                    const importPathPureWithChunkName = t.stringLiteral(importPathPure.value);

                    if (/^!/.test(importPath.value)) {
                        importPathPureWithChunkName.leadingComments = [{
                            type: 'CommentBlock',
                            value: 'priority:low'
                        }];
                    }

                    loader.replaceWith(
                        t.objectExpression([
                            t.objectProperty(
                                t.identifier('loader'),
                                t.arrowFunctionExpression(
                                    [],
                                    t.CallExpression(
                                        t.identifier('import'),
                                        [importPathPureWithChunkName]
                                    )
                                )
                            ),
                            t.objectProperty(
                                t.identifier('webpack'),
                                t.arrowFunctionExpression(
                                    [],
                                    t.arrayExpression(
                                        [t.CallExpression(
                                            t.memberExpression(t.identifier('require'), t.identifier('resolveWeak')),
                                            [importPathPure]
                                        )]
                                    )
                                )
                            ),
                            t.objectProperty(
                                t.identifier('modules'),
                                t.arrayExpression([importPath])
                            )
                        ])
                    );

                    path.__processed = true;
                }
            }
        }
    };
};
