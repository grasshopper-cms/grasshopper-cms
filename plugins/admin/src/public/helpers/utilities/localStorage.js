/*global define:false*/
define(['jquery'], function ($) {
    'use strict';

    /**
     * A simple wrapper for local storage..... just kidding! cookies - we're moving from local storage to cookies
     */
    return {
        get : get,
        set : set,
        remove : remove
    };

    function set(name, value, days) {
        var date,
            expires,
            cookie;

        days = days || 14;

        if (days) {
            date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        } else {
            expires = "";
        }

        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function get(name) {
        var nameEQ = name + "=",
            ca = document.cookie.split(';'),
            i,
            c;

        for(i=0; i < ca.length; i++) {
            c = ca[i];
            while (c.charAt(0)==' ') {
                c = c.substring(1,c.length);
            }
            if (c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length,c.length);
            }
        }
        return null;
    }

    function remove (name) {
        var $deferred = new $.Deferred();

        set(name,"",-1);
        $deferred.resolve();

        return $deferred.promise();
    }
});
