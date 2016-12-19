'use strict';

const api = require('grasshopper-api');
const BB = require('bluebird');
const plugins = require('./plugins');

module.exports = {
    authenticatedRequest: null,
    grasshopper: null,

    start : grasshopperService
};

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
                            resolve({
                                authenticatedRequest: grasshopper.core.request(token),
                                grasshopper: grasshopper
                            });
                            next();
                        })
                        .catch(reject);
                });
        })
        .then(plugins(options));
}
