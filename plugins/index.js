'use strict';

const cookieParser = require('cookie-parser');
const loadRoutes = require('./loadRoutes');
const BB = require('bluebird');
const path = require('path');
const atob = require('atob');

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

    /**
     * grasshopper.authenticatedRequest
     * grasshopper.grasshopper
     * @param grasshopper
     */
    return grasshopper => {

        //set adminDir
        const adminMountPoint = typeof options.adminMountPoint !== 'undefined' ? options.adminMountPoint : 'admin';
        const template = require.resolve('./plugin.layout.pug');
        options.app.use(cookieParser());

        options.app.use('/api', grasshopper.grasshopper.router);

        //set engine
        options.app.set('view engine', 'pug');

        // First load routes via the standard plugin system
        loadRoutes({
            app : options.app,
            express : options.express,
            grasshopperService : grasshopper,
            mountPath: '/api',
            plugins : options.plugins,
            adminMountPoint: adminMountPoint
        });
        // Then load legacy routes. These will be shadowed by the standard routes.
        options.app.use(`/${adminMountPoint}`, options.express.static(globalAssetsDir));

        options.app.use(`/${adminMountPoint}`, options.express.static(adminDistAssetsDir));
        options.app.use(`/${adminMountPoint}`, options.express.static(adminSrcAssetsDir));

        // @TODO turn the admin into a regular plugin and load it via loadRoutes as the first plugin
        options.app.use(`/${adminMountPoint}`, (req, res) => {

            let locals = {
                adminMountPoint: `${adminMountPoint}/`,
                pluginName: options.pluginName ?  `${options.pluginName}/` : '',
                mode: options.mode,
                curUser: {}
            };

            let authToken = req.cookies && req.cookies.authToken ? atob(req.cookies.authToken.split(' ')[1]) : '';

            grasshopper.grasshopper.core.request(authToken)
                .users
                .current()
                .then(function(reply) {
                    locals.curUser = reply;
                })
                .finally(function() {
                    res.render(template, locals);
                });
        });

        return grasshopper;
    };
}
