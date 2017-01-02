'use strict';

const path = require('path');
const legacyAdminPublicDir = path.join(__dirname, '..', 'public');
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

        // First load routes via the standard plugin system
        loadRoutes({
            app : options.app,
            express : options.express,
            grasshopperService : grasshopper,
            mountPath: '/api',
            plugins : options.plugins
        });
        // Then load legacy routes. These will be shadowed by the standard routes.
        options.app.use('/gh-admin',options.express.static(path.join(legacyAdminPublicDir,'admin-dev')));
        options.app.use('/gh-admin', (req, res) => {
            res.sendFile(path.join(legacyAdminPublicDir, 'admin-dev', 'index.html'));
        });
        return grasshopper;
    };
}

