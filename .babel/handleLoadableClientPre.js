const pathModule = require('path');
const resolve = require('resolve');
const { execSync } = require('child_process');
const webpackConfig = require('../webpack.config');

const extensions = ['.js'];
const moduleAliases = webpackConfig.resolve.alias;

const cache = {};
const getFirstLine = filepath => {
    if (!cache[filepath]) {
        cache[filepath] = execSync(`node ./.babel/getFirstLine.js --file '${filepath}'`).toString();
    }
    return cache[filepath];
};

let basedir;
let hasLoadable;

module.exports.__esModule = true;
module.exports.default = function ({ types: t }) {
    return {
        visitor: {
            Program: {
                enter: function enter(path, state) {
                    hasLoadable = false;
                    basedir = pathModule.dirname(state.file.opts.filename);
                }
            },
            ImportDeclaration: function ImportDeclaration(path) {
                if (path.node.__inserted) return;

                let source = path.node.source.value;
                if (/getLoadableComponent/.test(source)) {
                    if (!hasLoadable) {
                        hasLoadable = true;
                    } else {
                        path.remove();
                        return;
                    }
                }

                if (/^(#|@|\$)/.test(source)) {
                    const sourceParts = source.split('/');
                    sourceParts.unshift(moduleAliases[sourceParts.shift()]);
                    source = sourceParts.join('/');
                }

                let filepath;
                try {
                    filepath = resolve.sync(source, {
                        basedir,
                        extensions
                    });
                } catch(e) {
                    console.log(e);
                    return;
                }

                const transforms = [];
                const firstline = getFirstLine(filepath);
                const parts = firstline.split('#').pop().trim().split(' ');
                if (parts[0] !== 'loadable') return;

                if (!hasLoadable) {
                    hasLoadable = true;
                    const getLoadableImport = (
                        t.importDeclaration(
                            [t.importDefaultSpecifier(t.identifier('getLoadableComponent'))],
                            t.stringLiteral('$lib/getLoadableComponent')
                        )
                    );

                    getLoadableImport.__inserted = true;
                    transforms.push(getLoadableImport);
                }

                const prefix = parts[1] && parts[1] === 'low' ? '!' : '';
                const defaultSpecifier = path.get('specifiers').find(specifier => specifier.isImportDefaultSpecifier());
                transforms.push(
                    t.variableDeclaration("const", [
                        t.variableDeclarator(
                            t.identifier(defaultSpecifier.node.local.name),
                            t.CallExpression(
                                t.identifier('getLoadableComponent'),
                                [t.stringLiteral(prefix + path.node.source.value)]
                            )
                        )
                    ])
                );

                if (transforms.length > 0) path.replaceWithMultiple(transforms);
            }
        }
    };
};
