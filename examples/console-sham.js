/**
 * Fixed error: "console" is undefined in IE<10 if dev tools are not open
 */
(function(window) {

    if (window.console) return;

    window.console = (function() {
        var methods = 'assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn'.split(',');
        var noop = function() {};
        var object = {};
        var key;

        while(key = methods.pop()) {
            object[key] = noop;
        }

        return object;
    }());

}(window));