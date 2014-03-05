/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.3.3.1, 2014-02-28
 */

// It is attached to <input type="file"> element like <nrv-file-select="options">
app.directive('nrvFileSelect', [ 'fileUploader', function (fileUploader) {
    'use strict';

    return {
        link: function (scope, element, attributes) {
            fileUploader.isHTML5 || element.removeAttr('multiple');

            element.bind('change', function () {
                scope.$emit('file:add', fileUploader.isHTML5 ? this.files : this, scope.$eval(attributes.nrvFileSelect));
                (fileUploader.isHTML5 && element.attr('multiple')) && element.prop('value', null);
            });

            element.prop('value', null); // FF fix
        }
    };
}]);