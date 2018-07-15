module.exports.__esModule = true;
const resolve = require('resolve');
const pathModule = require('path');
const webpackConfig = require('../webpack.config');
const syntax = require('babel-plugin-syntax-dynamic-import');

const moduleAliases = webpackConfig.resolve.alias;
const extensions = ['.loadable.js']

module.exports.default = function ({ types: t }) {
    return {
        inherits: syntax,
        visitor: {
            ImportDeclaration: function ImportDeclaration(path, state) {
                if (path.node.__processed) return;
                const basedir = pathModule.dirname(state.file.opts.filename);

                let source = path.node.source.value;
                if (/^(#|@|\$)/.test(source)) {
                    const sourceParts = source.split('/');
                    sourceParts.unshift(moduleAliases[sourceParts.shift()]);
                    source = sourceParts.join('/');
                }

                let filePath;
                try {
                    filePath = resolve.sync(source, {
                        basedir,
                        extensions: [".js"]
                    });
                    console.log(filePath);
                } catch(e) {
                    console.log(e);
                }
                path.node.__processed = true;
            }
        }
    };
};
