'use strict';


import CONFIG from './../config.json';


let {
    copy,
    isElement,
    isString
    } = angular;


export default function __identity() {


    return class FileLikeObject {
        /**
         * Creates an instance of FileLikeObject
         * @param {File|HTMLInputElement|Object} fileOrInput
         * @constructor
         */
        constructor(fileOrInput) {
            var isInput = isElement(fileOrInput);
            var fakePathOrObject = isInput ? fileOrInput.value : fileOrInput;
            var postfix = isString(fakePathOrObject) ? 'FakePath' : 'Object';
            var method = '_createFrom' + postfix;
            this[method](fakePathOrObject);
        }
        /**
         * Creates file like object from fake path string
         * @param {String} path
         * @private
         */
        _createFromFakePath(path) {
            this.lastModified = null;
            this.size = null;
            this.type = 'like/' + path.slice(path.lastIndexOf('.') + 1).toLowerCase();
            this.name = path.slice(path.lastIndexOf('/') + path.lastIndexOf('\\') + 2);
        }
        /**
         * Creates file like object from object
         * @param {File|FileLikeObject} object
         * @private
         */
        _createFromObject(object) {
            this.lastModified = copy(object.lastModified);
            this.size = object.size;
            this.type = object.type;
            this.name = object.name;
        }
    }
}
