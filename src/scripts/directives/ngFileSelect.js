/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.9.8.1, 2013-12-31
 */

// It is attached to <input type="file"> element like <ng-file-select="options">
app.directive('ngFileSelect', [ '$fileUploader', function ($fileUploader) {
    'use strict';

    return {
        link: function (scope, element, attributes) {
            $fileUploader.isHTML5 || element.removeAttr('multiple');

            element.bind('change', function () {
                scope.$emit('file:add', this.files ? this.files : this, scope.$eval(attributes.ngFileSelect));
                $fileUploader.isHTML5 && element.prop('value', null);
            });
        }
    };
}]);