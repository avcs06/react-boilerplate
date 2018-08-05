'use strict';

const path = require('path');
const glob = require('glob-all');
const extend = require('extend');
const webpack = require('webpack');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const StyleExtHtmlWebpackPlugin = require('./.webpack/StyleExtHtmlWebpackPlugin');

const { ReactLoadablePlugin } = require('react-loadable/webpack');
const npm_package = require('./package.json');

const moduleAliases = {};
Object.keys(npm_package._moduleAliases).forEach(key => {
    moduleAliases[key] = path.resolve(__dirname, npm_package._moduleAliases[key]);
});

const env = process.env.NODE_ENV || 'development';
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
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: env === 'production'
                        }
                    }, {
                        loader: "postcss-loader",
                        options: {
                            config: {
                                ctx: {
                                    cssnano: {
                                        preset: ['default', {
                                            discardComments: {
                                                removeAll: true
                                            }
                                        }]
                                    },
                                    autoprefixer: {}
                                }
                            }
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
    },
    resolve: {
        alias: moduleAliases
    },
    optimization: {
        splitChunks: false
    }
};

const plugins1 = [
    new HtmlWebpackPlugin({
        filename: '../index.html',
        template: path.join(__dirname, 'app/index.html'),
        minify: env === 'production' ? {
            collapseWhitespace: true,
            useShortDoctype: true
        } : false
    }),
    new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async'
    }),
    new ReactLoadablePlugin({
        filename: './dist/assets/react-loadable.json',
    })
];

const plugins2 = [
    new PurgeCSSPlugin({
        paths: glob.sync([
            path.join(__dirname, './app/*.html'),
            path.join(__dirname, './app/**/*.js')
        ], { nodir: true }),
        whitelist: [],
        whitelistPatterns: [],
        whitelistPatternsChildren: []
    }),
    new StyleExtHtmlWebpackPlugin()
];

const developmentConfig = () => extend(true, {}, commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js'
    },
    plugins: [
       ...plugins1,
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[name].css',
        }),
        ...plugins2,
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
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
        ...plugins1,
        new MiniCssExtractPlugin({
            filename: 'css/[name]-[hash:8].min.css',
            chunkFilename: 'css/[name]-[chunkhash:8].min.css',
        }),
        ...plugins2,
        new UglifyJsPlugin()
    ]
});

module.exports = env == 'development' ? developmentConfig() : productionConfig();
