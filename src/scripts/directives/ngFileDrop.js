/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.4.1, 2014-03-25
 */

// It is attached to an element that catches the event drop file
app.directive('ngFileDrop', [ '$fileUploader', function ($fileUploader) {
    'use strict';

    return {
        // don't use drag-n-drop files in IE9, because not File API support
        link: !$fileUploader.isHTML5 ? angular.noop : function (scope, element, attributes) {
            element
                .bind('drop', function (event) {
                    var dataTransfer = event.dataTransfer ?
                        event.dataTransfer :
                        event.originalEvent.dataTransfer; // jQuery fix;
                    if (!dataTransfer || !dataTransfer.types.contains('Files')) return;
                    event.preventDefault();
                    event.stopPropagation();
                    scope.$broadcast('file:removeoverclass');
                    scope.$emit('file:add', dataTransfer.files, scope.$eval(attributes.ngFileDrop), this);
                })
                .bind('dragover', function (event) {
                    var dataTransfer = event.dataTransfer ?
                        event.dataTransfer :
                        event.originalEvent.dataTransfer; // jQuery fix;
                    if(!dataTransfer.types.contains('Files')) return false;
                    event.preventDefault();
                    event.stopPropagation();
                    dataTransfer.dropEffect = 'copy';
                    scope.$broadcast('file:addoverclass');
                })
                .bind('dragleave', function () {
                    var dataTransfer = event.dataTransfer ?
                        event.dataTransfer :
                        event.originalEvent.dataTransfer; // jQuery fix;
                    if(!dataTransfer.types.contains('Files')) return false;
                    scope.$broadcast('file:removeoverclass');
                });
        }
    };
}])