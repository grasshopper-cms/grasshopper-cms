'use strict';

let _ = require('lodash');
let path = require('path');
const loadAdmin = require('./admin');

module.exports = loadRoutes;

function loadRoutes(options) {
    let app, express, mountPath, grasshopperService, stacks = {};

    if (!options) {
        throw new Error('No options object supplied.');
    }

    app             = options.app;
    express         = options.express;
    grasshopperService     = options.grasshopperService;
    mountPath = options.mountPath;
    // Commenting this out, since middlewareBase is somehow mutated after requiring in startup while options is not
    // middlewareBase  = options.middlewares;

    if (!app) {
        throw new Error('No app, express, routes, or middlewares value supplied: ' + JSON.stringify(options));
    }

    options.plugins.forEach(plugin => {

        let pluginDir = path.resolve('node_modules',`${plugin}`,'app', 'pluginAdmin');
        console.log(`installing and building ${plugin}`);
        loadAdmin(app, express, pluginDir);

        require(`${plugin}/app/pluginApi/startup`)(grasshopperService)
        // Erroring out the startup shouldn't fail the route registrations
            .finally(() => {
                require(`${plugin}/app/pluginApi/routes.json`).forEach(function(route) {
                    let router;

                    switch (route[0]) {
                    case 'stack':
                        stacks[route[1]] = route[2];
                        break;
                        // passing in a router or middleware that doesn't need verb
                    case 'use':
                        router = getMiddlewares(route[2], stacks, plugin, grasshopperService);

                        // If path is provided use that
                        if (!!route[1]) {
                            // mountPath should be added in here too
                            app.use(route[1], router);
                        } else {
                            app.use(router);
                        }
                        break;
                        // Passing in middlewares
                    default:
                        router = express.Router();
                        router
                            .route(route[1])
                            [route[0].toLowerCase()](
                            getMiddlewares(route[2], stacks, plugin, grasshopperService)
                        );

                        app.use(mountPath || '/', router);
                        break;
                    }
                });
            });
    });
}

function getMiddlewares(middlewares, stacks, plugin, grasshopperService) {
    return _
        .chain(middlewares)
        .map(function(ware) {
            if (stacks[ware]) {
                return stacks[ware];
            } else {
                return ware;
            }
        })
        .flatten()
        .map(function(ware) {
            return require(`${plugin}/app/pluginApi/middlewares/${ware}`)(grasshopperService);
        })
        .value();
}
