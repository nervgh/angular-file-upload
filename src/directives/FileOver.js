'use strict';


import CONFIG from './../config.json';


export default function __(FileUploader, FileOver) {


    return {
        link: function(scope, element, attributes) {
            var uploader = scope.$eval(attributes.uploader);

            if (!(uploader instanceof FileUploader)) {
                throw new TypeError('"Uploader" must be an instance of FileUploader');
            }

            var object = new FileOver({
                uploader: uploader,
                element: element
            });

            object.getOverClass = function() {
                return attributes.overClass || this.overClass;
            };
        }
    };


}


__.$inject = [
    'FileUploader',
    'FileOver'
];