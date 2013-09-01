/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.5.1, 2012-08-31
 */

// It is attached to <input type="file"> element like <ng-file-select="options">
app.directive('ngFileSelect', function () {
    'use strict';

    return {
        link: function (scope, element, attributes) {
            if (!window.File || !window.FormData) {
                element.removeAttr('multiple');
            }

            element.bind('change', function () {
                scope.$emit('file:add', this.files ? this.files : this, scope.$eval(attributes.ngFileSelect));
            });
        }
    };
});