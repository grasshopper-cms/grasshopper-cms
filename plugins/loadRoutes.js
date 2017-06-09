'use strict';

const BB = require('bluebird');
const loadAdmin = require('./admin');

module.exports = loadRoutes;

function loadRoutes(options, grasshopperCms) {

    return BB.map(options.grasshopper.plugins, plugin => {
        console.log(`installing and building plugin: ${plugin.name}`);

        return BB
            .try(() => require(`${plugin.path}/startup`)(grasshopperCms, options.app))
            .then(router => {
                if (router) {
                    options.app.use(`${options.grasshopper.adminMountPoint}/${plugin.name}`, router);
                }

                // use the default middleware last to allow user to preload data for their templates
                loadAdmin(plugin, options, grasshopperCms);
            })
            .catch(e => {
                console.log('load routes error', plugin.name, e);
            });
    });
}
