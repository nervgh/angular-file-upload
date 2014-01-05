/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.3.1, 2014-01-05
 */

// It is attached to <input type="file"> element like <ng-file-select="options">
app.directive('ngFileSelect', [ '$fileUploader', function ($fileUploader) {
    'use strict';

    return {
        link: function (scope, element, attributes) {
            $fileUploader.isHTML5 || element.removeAttr('multiple');

            element.bind('change', function () {
                scope.$emit('file:add', $fileUploader.isHTML5 ? this.files : this, scope.$eval(attributes.ngFileSelect));
                $fileUploader.isHTML5 && element.prop('value', null);
            });

            element.prop('value', null); // FF fix
        }
    };
}]);