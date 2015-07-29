'use strict';


import CONFIG from './../config.json';


export default  ($parse, FileUploader, FileSelect) => {


    return {
        link: (scope, element, attributes) => {
            var uploader = scope.$eval(attributes.uploader);

            if (!(uploader instanceof FileUploader)) {
                throw new TypeError('"Uploader" must be an instance of FileUploader');
            }

            var object = new FileSelect({
                uploader: uploader,
                element: element
            });

            object.getOptions = $parse(attributes.options).bind(object, scope);
            object.getFilters = () => attributes.filters;
        }
    };


}


module.exports.$inject = [
    '$parse',
    'FileUploader',
    'FileSelect'
];