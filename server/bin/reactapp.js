#!/usr/bin/env node

process.env.NODE_ENV = 'production';
require('#server/index.js');

// Name this file as (whatever name you want to give the process).js
