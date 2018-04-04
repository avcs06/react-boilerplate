'use strict';

var env = process.env.NODE_ENV || 'development';

var clientConfig = require('./webpack.client.config');
var serverConfig = require('./webpack.server.config');
var multiConfig = [clientConfig, serverConfig];
multiConfig.watch = env === 'development';

module.exports = multiConfig;
