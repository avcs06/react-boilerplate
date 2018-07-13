const fs = require('fs');
const path = require('path');
const extend = require('extend');
let config = {};

/*
    If you want to maintain server config on server itself
    Create a .secrets/config.json file outside your project folder
*/
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../.secrets/config.json'), 'utf-8'));
} catch (e) {
    config = {};
}

module.exports = extend({
    port: '1234'
}, config);
