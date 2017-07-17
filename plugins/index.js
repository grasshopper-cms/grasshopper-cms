'use strict';

const _ = require('lodash');
const BB = require('bluebird');
const cookieParser = require('cookie-parser');
const loadRoutes = require('./loadRoutes');
const path = require('path');
const atob = require('atob');
const opts = require('./options');
const pkg = require('../package.json');

const adminSrcAssetsDir = path.join(__dirname, 'admin', 'src', 'public');
const adminDistAssetsDir = path.join(__dirname, 'admin', 'dist', 'public');
const globalAssetsDir = path.join(__dirname, 'public');

module.exports = startup;

/**
 * An array of npm module names to use as plugins
 * @param options.plugins
 * @returns {function(*=)}
 */
function startup(options) {
    options.grasshopper.adminMountPoint = options.grasshopper.adminMountPoint || '/admin';
    options.grasshopper.apiMountPoint = options.grasshopper.apiMountPoint || '/api';
    options.grasshopper.plugins = options.grasshopper.plugins || [];

    // Mutate, do not replace, opts object
    _.assign(opts, options);

    /**
     * grasshopper.authenticatedRequest
     * grasshopper.grasshopper
     * @param grasshopper
     */
    return grasshopperCms => {

        //set adminDir
        const template = require.resolve('./plugin.layout.pug');
        options.app.use(cookieParser());

        options.app.use(options.grasshopper.apiMountPoint, grasshopperCms.grasshopper.router);

        //set engine
        options.app.set('view engine', 'pug');

        // First load routes via the standard plugin system
        return BB.try(() => loadRoutes(options, grasshopperCms))
            .then(() => {
                // Then load legacy routes. These will be shadowed by the standard routes due to the order of loading
                options.app.use(options.grasshopper.adminMountPoint, options.express.static(globalAssetsDir));

                options.app.use(options.grasshopper.adminMountPoint, options.express.static(adminDistAssetsDir));

                // Only server assets from src foor admin if in developer mode
                if (options.mode === 'develop') {
                    options.app.use(options.grasshopper.adminMountPoint, options.express.static(adminSrcAssetsDir));
                }

                // Serve the base (legacy) admin
                options.app.use(options.grasshopper.adminMountPoint, (req, res) => {

                    let locals = {
                        isLegacyAdmin : true,
                        adminMountPoint: `${options.grasshopper.adminMountPoint}/`,
                        pluginName: '',
                        // all plugins need to be send in for each plugin due to the sidebar
                        plugins: options.grasshopper.plugins,
                        mode: options.mode,
                        ghaConfigs : {
                            apiEndpoint : options.grasshopper.apiMountPoint
                        },
                        curUser: {},
                        version: pkg.version
                    };

                    let authToken = req.cookies && req.cookies.authToken ? atob(req.cookies.authToken.split(' ')[1] || '') : '';

                    grasshopperCms.grasshopper.core.request(authToken)
                        .users
                        .current()
                        .then(function(reply) {
                            locals.curUser = reply;
                        })
                        .finally(function() {
                            // Render the legacy admin
                            res.render(template, locals);
                        });
                });

                return grasshopperCms;
            });
    };
}
