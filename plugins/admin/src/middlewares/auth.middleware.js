'use strict';

const ghCore = require('grasshopper-core');
const atob = require('atob');
const options = require('../../../../plugins/options');

module.exports = (req, res, next) => {

    let authToken = '';

    if (req.cookies && req.cookies.authToken) {
        authToken = atob(req.cookies.authToken.split(' ')[1]);
    }

    ghCore.request(authToken)
        .users
        .current()
        .then(user => {
            if (!user) {
                throw new Error('No User');
            }

            res.locals.currentUser = user;
            next();
        })
        .catch(err => {
            let adminMountPoint = options.get().grasshopper.adminMountPoint; // Set on startup
            let adminBase = adminMountPoint || '/admin';

            res.redirect(`${adminBase}/login`);
        })
};
