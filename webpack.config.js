'use strict';

var path = require('path');
var extend = require('extend');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var env = process.env.NODE_ENV || 'development';
var htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, 'app/index.html'),
    inject: 'body',
    filename: '../index.html'
});

var commonConfig = {
    target: 'web',
    entry: {
        app: path.join(__dirname, 'app/index.js')
    },
    output: {
        path: path.join(__dirname, '/dist/assets'),
        publicPath: '/static/'
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
            }, {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "postcss-loader",
                        options: {
                            fn: () => require('autoprefixer')
                        }
                    }, {
                        loader: "sass-loader"
                    }]
                })
            }, {
                test: /\.png$/,
                loader: "url-loader",
                options: {
                    limit: 10000,
                    mimetype: 'image/png'
                }
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader",
                options: {
                    limit: 10000,
                    mimetype: 'application/font-woff'
                }
            }, {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            }, {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: path.resolve('./loader.js')
            }
        ]
    }
};

var developmentConfig = extend(true, {}, commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js'
    },
    plugins: [
        htmlWebpackPlugin,
        new ExtractTextPlugin('[name].css'),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
});

var productionConfig = extend(true, {}, commonConfig, {
    mode: 'production',
    bail: true,
    output: {
        filename: '[name]-[hash:8].min.js',
        chunkFilename: '[name]-[chunkhash:8].min.js'
    },
    plugins: [
        htmlWebpackPlugin,
        new ExtractTextPlugin('[name]-[hash].min.css'),
        new UglifyJsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]
});

module.exports = env == 'development' ? developmentConfig : productionConfig;
