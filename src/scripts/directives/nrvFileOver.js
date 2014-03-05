/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.3.3.1, 2014-02-28
 */

// It is attached to an element which will be assigned to a class "nrv-file-over" or nrv-file-over="className"
app.directive('nrvFileOver', function () {
    'use strict';

    return {
        link: function (scope, element, attributes) {
            scope.$on('file:addoverclass', function () {
                element.addClass(attributes.nrvFileOver || 'nrv-file-over');
            });
            scope.$on('file:removeoverclass', function () {
                element.removeClass(attributes.nrvFileOver || 'nrv-file-over');
            });
        }
    };
});