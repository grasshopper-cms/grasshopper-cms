'use strict';

const path = require('path');

module.exports = loadAdmin;

function loadAdmin(app, express, pluginDir, adminMountPoint) {
    // This route should not be hard coded

    const pluginName = 'commerce';
    app.get([
        `${adminMountPoint}/${pluginName}`,
        `${adminMountPoint}/${pluginName}/`,
        `${adminMountPoint}/${pluginName}/index.html`],
        render(pluginName, adminMountPoint)
    );

    app.use(`${adminMountPoint}`, express.static(pluginDir));
    app.use(`${adminMountPoint}`, render(pluginName));
}

function render(pluginName, adminMountPoint) {
    return (req, res) => {
        res.locals = {
            pluginName,
            adminMountPoint: adminMountPoint
        };
        res.render(path.join(__dirname, 'plugin.view.pug'));
    };
}