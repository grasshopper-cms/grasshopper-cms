'use strict';

const path = require('path');
const adminSrcAssetsDir = path.join(__dirname, 'admin', 'src', 'public');
const adminDistAssetsDir = path.join(__dirname, 'admin', 'dist', 'public');
const globalAssetsDir = path.join(__dirname, 'public');
const loadRoutes = require('./loadRoutes');

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

        // @TODO loop through plugins. Do magic stuff.
        options.app.use(`/${adminMountPoint}`, (req, res) => {
            //res.sendFile(path.join(legacyAdminPublicDir, 'admin-dev', 'index.html'));
            res.render(template, {
                adminMountPoint: `${adminMountPoint}/`,
                pluginName: options.pluginName ?  `${options.pluginName}/` : '',
                mode: options.mode
            });
        });
        return grasshopper;
    };
}
