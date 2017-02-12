'use strict';

const ghCore = require('grasshopper-core');
const atob = require('atob');

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
            console.log('error', err);
            let adminBase = req.adminMountPoint ? req.adminMountPoint : 'admin';
            res.redirect(`/${adminBase}/login`);
        })
};
