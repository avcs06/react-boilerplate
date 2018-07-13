module.exports.__esModule = true;
const syntax = require('babel-plugin-syntax-dynamic-import');

module.exports.default = function({ types: t }) {
    return {
        inherits: syntax,
        visitor: {
            ImportDeclaration: function ImportDeclaration(path) {
                const source = path.node.source.value;
                if (!/getLoadableComponent/.test(source)) return;

                const defaultSpecifier = path.get('specifiers').find(specifier => specifier.isImportDefaultSpecifier());

                if (!defaultSpecifier) return;

                const bindingName = defaultSpecifier.node.local.name;
                const binding = path.scope.getBinding(bindingName);

                binding.referencePaths.forEach(refPath => {
                    const callExpression = refPath.parentPath;
                    if (!callExpression.isCallExpression()) return;

                    const args = callExpression.get('arguments');
                    if (args.length !== 1) throw callExpression.error;

                    const loader = args[0];
                    const importPath = callExpression.node.arguments[0];
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
                                        [t.callExpression(
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
                });
            }
        }
    };
};
