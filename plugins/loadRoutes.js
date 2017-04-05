'use strict';

const BB = require('bluebird');
const loadAdmin = require('./admin');

module.exports = loadRoutes;

function loadRoutes(options, grasshopperCms) {

    return BB.map(options.grasshopper.plugins, plugin => {

        // why rename it?
        plugin.dir = plugin.path;

        console.log(`installing and building plugin: ${plugin.name}`);

        loadAdmin(plugin, options, grasshopperCms);

        return BB
            .try(() => require(`${plugin.dir}/startup`)(grasshopperCms, options.app))
            .then(router => {
                if (router) {
                    options.app.use(`${options.grasshopper.adminMountPoint}/${plugin.name}`, router);
                }
            })
            .catch(e => {
                console.log('load routes error', plugin.name, e);
            });
    });
}
