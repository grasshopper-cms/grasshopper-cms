#!/usr/bin/env node
'use strict';

const execSync = require('child_process').execSync;
const requirejs = require('requirejs');
const path = require('path');

// can this be done w a symlink?
execSync('cp -r dist/public/vendor src/public', { stdio : 'inherit' });

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
        console.log('DONE - removing copied files');
        execSync('rm -r src/public/vendor', { stdio : 'inherit' });
    },
    (error) => {
        console.log('ERROR', error);
    }
);