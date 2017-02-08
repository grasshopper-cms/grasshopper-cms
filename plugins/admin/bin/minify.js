#!/usr/bin/env node
'use strict';

const requirejs = require('requirejs');
const path = require('path');

let options = {
    baseUrl: path.join(__dirname, '..', 'src', 'public'),
    mainConfigFile: path.join(__dirname, '..', 'src', 'public', 'main.js'),
    name: 'main',
    out: path.join(__dirname, '..', 'dist', 'public', 'main.min.js'),
    optimize: 'uglify2',
    preserveLicenseComments: false,
    generateSourceMaps: true,
    include: ['vendor/requirejs/require.js']
};

requirejs.optimize(
    options,
    () => {
        console.log('DONE');
    },
    (error) => {
        console.log('ERROR', error);
    }
);