'use strict';

const path = require('path');
const glob = require('glob-all');
const extend = require('extend');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const { ReactLoadablePlugin } = require('react-loadable/webpack');

const commonConfig = {
    target: 'web',
    entry: {
        app: path.join(__dirname, 'app/index.js')
    },
    output: {
        path: path.join(__dirname, '/dist/assets/'),
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
                use: [
                    'babel-loader'
                ]
            }, {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader", {
                        loader: "postcss-loader",
                        options: {
                            fn: () => require('autoprefixer')
                        }
                    }, "sass-loader"
                ]
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
            }
        ]
    }
};

const htmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: '../index.html',
    template: path.join(__dirname, 'app/index.html')
});

const reactLoadablePlugin = new ReactLoadablePlugin({
    filename: './dist/assets/react-loadable.json',
});

const developmentConfig = () => extend(true, {}, commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js'
    },
    plugins: [
        htmlWebpackPlugin,
        reactLoadablePlugin,
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[name].css',
        }),
        new PurifyCSSPlugin({
            paths: glob.sync([
                path.join(__dirname, './app/*.html'),
                path.join(__dirname, './app/**/*.js')
            ])
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
});

const productionConfig = () => extend(true, {}, commonConfig, {
    mode: 'production',
    bail: true,
    output: {
        filename: 'js/[name]-[hash:8].min.js',
        chunkFilename: 'js/[name]-[chunkhash:8].min.js'
    },
    plugins: [
        htmlWebpackPlugin,
        reactLoadablePlugin,
        new MiniCssExtractPlugin({
            filename: 'css/[name]-[hash:8].min.css',
            chunkFilename: 'css/[name]-[chunkhash:8].min.css',
        }),
        new PurifyCSSPlugin({
            paths: glob.sync([
                path.join(__dirname, './app/*.html'),
                path.join(__dirname, './app/**/*.js')
            ]),
            minimize: true
        }),
        new UglifyJsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]
});

const env = process.env.NODE_ENV || 'development';
module.exports = env == 'development' ? developmentConfig() : productionConfig();
