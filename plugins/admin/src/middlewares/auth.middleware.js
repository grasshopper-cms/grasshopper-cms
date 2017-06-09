'use strict';

const ghCore = require('grasshopper-core');
const atob = require('atob');
const options = require('../../../../plugins/options');

module.exports = (req, res, next) => {

    let authToken = '';

    if (req.cookies && req.cookies.authToken) {
        let token = req.cookies.authToken.split(' ')[1] || '';
        authToken = atob(token);
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
            const adminMountPoint = options.grasshopper.adminMountPoint; // Set on startup
            res.redirect(res.loginRedirect || `${adminMountPoint}/login`);
        })
};
