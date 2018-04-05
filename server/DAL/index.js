const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DAL = {};

fs.readdirSync(path.join(__dirname, './')).forEach((file) => {
    if(file !== 'index.js' && file !== 'base.js') {
        const model = file.replace('.js', '');
        !DAL[model] && (DAL[model] = mongoose.model(model, require('./' + model).default));
    }
});

module.exports = DAL;
