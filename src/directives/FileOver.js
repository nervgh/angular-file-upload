'use strict';


import CONFIG from './../config.json';


export default function __identity(FileUploader, FileOver) {


    return {
        link: (scope, element, attributes) => {
            var uploader = scope.$eval(attributes.uploader);

            if (!(uploader instanceof FileUploader)) {
                throw new TypeError('"Uploader" must be an instance of FileUploader');
            }

            var object = new FileOver({
                uploader: uploader,
                element: element
            });

            object.getOverClass = () => attributes.overClass || object.overClass;
        }
    };


}


__identity.$inject = [
    'FileUploader',
    'FileOver'
];