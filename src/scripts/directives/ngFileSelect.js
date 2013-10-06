/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.7, 2012-10-06
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
                window.File && element.prop('value', null);
            });
        }
    };
});