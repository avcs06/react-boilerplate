#!/usr/bin / env node

const parser = require('nomnom');
const firstline = require('firstline');
const file = parser.option('file', { abbr: 'f', help: 'path to file' }).parse().file;

firstline(file).then(line => {
    console.log(line);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
