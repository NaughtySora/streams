'use strict';

const { globSync } = require('node:fs');
const { resolve } = require('node:path');

const files = globSync('*.js', { cwd: __dirname, exclude: ['index.js'] });
for (const file of files) require(resolve(__dirname, file));