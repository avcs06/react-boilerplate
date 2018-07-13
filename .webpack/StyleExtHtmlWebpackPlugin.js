'use strict';

class StyleExtHtmlWebpackPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap('StyleExtHtmlWebpackPlugin', compilation => {
            compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tap(
                'StyleExtHtmlWebpackPlugin',
                data => {
                    const cssFilePath = data.assets.css.pop().replace(/\/static\//, '');
                    data.html = data.html.replace('</head>', '\t<style>\n' + compilation.assets[cssFilePath].source() + '\n\t\t</style>\n\t</head>');
                    return data;
                }
            );
        });
    }
}

module.exports = StyleExtHtmlWebpackPlugin;
