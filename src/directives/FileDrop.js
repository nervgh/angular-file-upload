'use strict';


import CONFIG from './../config.json';


export default ($parse, FileUploader, FileDrop) => {


    return {
        link: (scope, element, attributes) => {
            var uploader = scope.$eval(attributes.uploader),
                fileDropOptions = {
                    uploader: uploader,
                    element: element
                },
                onDragEnterCallback = scope.$eval(attributes.onDragEnter),
                onDragLeaveCallback = scope.$eval(attributes.onDragLeave);

            if (!(uploader instanceof FileUploader)) {
                throw new TypeError('"Uploader" must be an instance of FileUploader');
            }

            if (!uploader.isHTML5) return;

            if (onDragEnterCallback) {
                if (typeof onDragEnterCallback !== 'function') {
                    throw new TypeError('"onDragEnter" callback must be a functions');
                }
                fileDropOptions._onDragEnterCallback = onDragEnterCallback;
            }

            if (onDragLeaveCallback) {
                if (typeof onDragLeaveCallback !== 'function') {
                    throw new TypeError('"onDragLeave" callback must be a functions');
                }
                fileDropOptions._onDragLeaveCallback = onDragLeaveCallback;
            }

            var object = new FileDrop(fileDropOptions);

            object.getOptions = $parse(attributes.options).bind(object, scope);
            object.getFilters = () => attributes.filters;
        }
    };


}


module.exports.$inject = [
    '$parse',
    'FileUploader',
    'FileDrop'
];