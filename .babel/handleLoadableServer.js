const syntax = require('babel-plugin-syntax-dynamic-import');

module.exports.__esModule = true;
module.exports.default = function({ template, types: t }) {
    const buildImport = template('\n    Promise.resolve().then(() => require(SOURCE))\n  ');

    return {
        inherits: syntax,
        visitor: {
            CallExpression: function(path) {
                const { node } = path;
                if (t.isIdentifier(node.callee, { name: 'import' })) {
                    const importArguments = node.arguments;

                    const comments = importArguments[0].leadingComments || [];
                    if (comments.some(c => c.value === 'priority:low')) {
                        importArguments[0] = t.stringLiteral('$components/Loader');
                    }

                    const isString = t.isStringLiteral(importArguments[0]) || t.isTemplateLiteral(importArguments[0]);
                    if (isString) {
                        t.removeComments(importArguments[0]);
                    }

                    const newImport = buildImport({
                        SOURCE: isString ? importArguments : t.templateLiteral([t.templateElement({
                            raw: '',
                            cooked: ''
                        }), t.templateElement({
                            raw: '',
                            cooked: ''
                        }, true)], importArguments)
                    });
                    path.replaceWith(newImport);
                }
            }
        }
    };
};
