/**
 * Fixed error: "console" is undefined in IE<10 if dev tools are not open
 */
(function(a){a.console||(a.console=function(){for(var a="assert clear count debug dir dirxml error exception group groupCollapsed groupEnd info log markTimeline profile profileEnd table time timeEnd timeStamp trace warn".split(" "),d=function(){},b={},c;c=a.pop();)b[c]=d;return b}())})(window);