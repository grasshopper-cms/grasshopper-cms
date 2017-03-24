'use strict';

const api = require('grasshopper-api');
const plugins = require('./plugins');
const BB = require('bluebird');

let result = {
    authenticatedRequest: null,
    grasshopper: null,
    start : grasshopperService
};

module.exports = result;

/**
 * options.app The express app
 * options.express express
 * options.grasshopper The configuration to startup grasshopper-api
 * options.plugins An array of npm names to use as plugins
 *
 * @param options
 */
function grasshopperService(options) {
    const grasshopper = api(options.grasshopper);

    // What is available:
    // grasshopper.router
    // grasshopper.core
    // grasshopper.bridgetown

    return new BB((resolve, reject) => {
            grasshopper
                .core.event.channel('/system/db')
                .on('start', (payload, next) => {
                    grasshopper
                        .core.auth('basic', {
                            username: options.admin.username, password: options.admin.password
                        })
                        .then(token => {
                            // Store these for convenience
                            result.authenticatedRequest = grasshopper.core.request(token);
                            result.grasshopper = grasshopper;

                            resolve(result);
                            next();
                        })
                        .catch(reject);
                });
        })
        .then(plugins(options));
}
