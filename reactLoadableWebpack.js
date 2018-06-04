function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
const _babelPluginSyntaxDynamicImport = require('babel-plugin-syntax-dynamic-import');
const _babelPluginSyntaxDynamicImport2 = _interopRequireDefault(_babelPluginSyntaxDynamicImport);

module.exports.default = function(_ref) {
    const t = _ref.types;

    return {
        inherits: _babelPluginSyntaxDynamicImport2.default,
        visitor: {
            ImportDeclaration: function ImportDeclaration(path) {
                const source = path.node.source.value;
                if (!/getLoadableComponent/.test(source)) return;

                const defaultSpecifier = path.get('specifiers').find(specifier => specifier.isImportDefaultSpecifier());

                if (!defaultSpecifier) return;

                const bindingName = defaultSpecifier.node.local.name;
                const binding = path.scope.getBinding(bindingName);

                binding.referencePaths.forEach(refPath => {
                    let callExpression = refPath.parentPath;

                    if (callExpression.isMemberExpression() && callExpression.node.computed === false && callExpression.get('property').isIdentifier({ name: 'Map' })) {
                        callExpression = callExpression.parentPath;
                    }

                    if (!callExpression.isCallExpression()) return;

                    const args = callExpression.get('arguments');
                    if (args.length !== 1) throw callExpression.error;

                    const loader = args[0];
                    const importPath = loader.node.arguments[0];

                    loader.replaceWith(
                        t.objectExpression([
                            t.objectProperty(
                                t.identifier('loader'),
                                t.arrowFunctionExpression([], loader.node)
                            ),
                            t.objectProperty(
                                t.identifier('webpack'),
                                t.arrowFunctionExpression(
                                    [],
                                    t.arrayExpression(
                                        [t.callExpression(
                                            t.memberExpression(t.identifier('require'), t.identifier('resolveWeak')),
                                            [importPath]
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

module.exports.__esModule = true;
