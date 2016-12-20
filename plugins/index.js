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
        options.app.use('/admin',options.express.static(path.join(legacyAdminPublicDir,'admin')));
        options.app.use('/admin', (req, res) => {
            res.sendFile(path.join(legacyAdminPublicDir, 'admin', 'index.html'));
        });
        return grasshopper;
    };
}

