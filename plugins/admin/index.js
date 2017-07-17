'use strict';

const path = require('path');
const atob = require('atob');
const url = require('url');
const pkg = require('../../package.json');

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

    app.use(`${adminMountPoint}/${plugin.name}`, options.express.static(path.join(plugin.path, 'public')));
}

function render(plugin, options, grasshopperCms) {
    return (req, res) => {
        Object.assign(res.locals, {
            isLegacyAdmin : false,
            adminMountPoint: options.grasshopper.adminMountPoint + '/',
            pluginName: plugin.name,
            // all plugins need to be send in for each plugin due to the sidebar
            plugins: options.grasshopper.plugins,
            ghaConfigs: {
                apiEndpoint: options.grasshopper.apiMountPoint
            },
            version: pkg.version
        });

        let authToken = req.cookies && req.cookies.authToken
            ? atob(req.cookies.authToken.split(' ')[1])
            : '';

        grasshopperCms.grasshopper.core.request(authToken)
            .users
            .current()
            .then(reply => {
                res.locals.curUser = reply;

                let templatePath;

                if (plugin.template) {
                    res.locals.basedir = path.join(__dirname, '..');
                    templatePath = path.join(plugin.path, plugin.template);
                } else {
                    templatePath = path.join(__dirname, '../plugin.layout.pug')
                }

                res.render(templatePath);
            });
    };
}
