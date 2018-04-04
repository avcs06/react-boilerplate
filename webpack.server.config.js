'use strict';

var fs = require('fs');
var path = require('path');
var env = process.env.NODE_ENV || 'development';

var plugins = [];
if(env === 'development') {
    var WebpackShellPlugin = require('webpack-shell-plugin');
    plugins.push(new WebpackShellPlugin({
        dev: true,
        onBuildEnd: ['npm run test']
    }));
}

module.exports = {
    target: 'node',
    entry: {
        server: path.resolve(__dirname, 'server/index.js'),
        test: path.resolve(__dirname, 'server/test.js'),
    },
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].js',
    },

    externals: fs.readdirSync(path.resolve(__dirname, 'node_modules')).concat([
        'react-dom/server', 'react/addons',
    ]).reduce(function (ext, mod) {
        ext[mod] = 'commonjs ' + mod
        return ext
    }, {}),

    node: {
        __filename: true,
        __dirname: true
    },

    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                enforce: "pre",
                loader: "eslint-loader"
            }, {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.node$/,
                loader: "node-loader"
            }
        ]
    },
    plugins: plugins
}
