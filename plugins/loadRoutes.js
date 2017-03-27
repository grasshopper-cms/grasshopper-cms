'use strict';

let _ = require('lodash');
let path = require('path');
const loadAdmin = require('./admin');

module.exports = loadRoutes;

function loadRoutes(options) {
    let app, express, mountPath, grasshopperService, stacks, adminMountPoint, plugins;

    if (!options) {
        throw new Error('No options object supplied.');
    }

    app                     = options.app;
    express                 = options.express;
    grasshopperService      = options.grasshopperService;
    mountPath               = options.mountPath;
    adminMountPoint         = options.adminMountPoint;
    plugins                 = options.plugins || [];

    //console.log(options);
    // Commenting this out, since middlewareBase is somehow mutated after requiring in startup while options is not
    // middlewareBase  = options.middlewares;

    if (!app) {
        throw new Error('No app, express, routes, or middlewares value supplied: ' + JSON.stringify(options));
    }



    plugins.forEach(plugin => {
        plugin.dir = (plugin.path) ? plugin.path : path.resolve('node_modules',`${plugin.name}`);
        console.log(`installing and building ${plugin.name}`);

        loadAdmin(app, express, grasshopperService, plugins, plugin, adminMountPoint, mountPath);

        require(`${plugin.dir}/app/startup`)(grasshopperService)
        // Erroring out the startup shouldn't fail the route registrations
            .finally(() => {
                // If they are using a routes file then process through expressively
                require(`${plugin.dir}/app/api/routes.json`).forEach(function(route) {
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
            return require(`${plugin}/app/api/middlewares/${ware}`)(grasshopperService);
        })
        .value();
}
