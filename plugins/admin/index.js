'use strict';

const path = require('path');
const atob = require('atob');
const url = require('url');

module.exports = loadAdmin;

function loadAdmin(plugin, options, grasshopperCms) {
    const adminMountPoint = options.grasshopper.adminMountPoint;
    const app = options.app;

    app.get([
        `${adminMountPoint}/${plugin.name}`,
        `${adminMountPoint}/${plugin.name}/`,
        `${adminMountPoint}/${plugin.name}/index.html`],
        render(plugin, options, grasshopperCms)
    );

    app.use(`${adminMountPoint}/${plugin.name}`, options.express.static(path.join(plugin.dir, 'public')));
}

function render(plugin, options, grasshopperCms) {
    const adminMountPoint = options.grasshopper.adminMountPoint;
    return (req, res) => {
        res.locals = {
            isLegacyAdmin : false,
            adminMountPoint: adminMountPoint + '/',
            pluginName: plugin.name,
            // all plugins need to be send in for each plugin due to the sidebar
            plugins: options.grasshopper.plugins,
            ghaConfigs: {
                apiEndpoint: options.grasshopper.apiMountPoint
            },
            curUser: {}
        };

        let authToken = req.cookies && req.cookies.authToken ? atob(req.cookies.authToken.split(' ')[1]) : '';

        grasshopperCms.grasshopper.core.request(authToken)
            .users
            .current()
            .then(function(reply) {
                res.locals.curUser = reply;
            })
            .finally(function() {
                // Render the legacy admin
                res.render(path.join(__dirname, '../plugin.layout.pug'));
            });
    };
}
