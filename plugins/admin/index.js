'use strict';

const path = require('path');
const atob = require('atob');
const url = require('url');

module.exports = loadAdmin;

function loadAdmin(app, express, grasshopper, plugins, plugin, adminMountPoint, apiMountPoint) {
    app.get([
        `${adminMountPoint}/${plugin.name}`,
        `${adminMountPoint}/${plugin.name}/`,
        `${adminMountPoint}/${plugin.name}/index.html`],
        render(plugins, plugin.name, grasshopper, adminMountPoint, apiMountPoint)
    );

    app.use(`${adminMountPoint}`, express.static(path.join(__dirname, 'dist/public')));
    app.use(`${adminMountPoint}/${plugin.name}`, express.static(path.join(plugin.dir, 'app','public')));
}

function render(plugins, pluginName, grasshopper, adminMountPoint, apiMountPoint) {
    return (req, res) => {
        res.locals = {
            pluginName: pluginName,
            plugins: plugins,
            adminMountPoint: adminMountPoint,
            ghaConfigs: {
                apiEndpoint: apiMountPoint
            },
            isPlugin: (url.parse(req.url).pathname.indexOf(pluginName) > -1) ? true : false,
            curUser: {}
        };

        let authToken = req.cookies && req.cookies.authToken ? atob(req.cookies.authToken.split(' ')[1]) : '';

        grasshopper.grasshopper.core.request(authToken)
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
