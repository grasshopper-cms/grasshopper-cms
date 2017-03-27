'use strict';

let options = {};

/** Module to store the passed in options */
module.exports = {
    set: function (opts) {
        options = opts;
    },
    get: function() {
        return options;
    }
};
