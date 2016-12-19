'use strict';


import CONFIG from './../config.json';


let {
    copy,
    extend,
    element,
    isElement
    } = angular;


export default function __identity($compile, FileLikeObject) {
    
    
    return class FileItem {
        /**
         * Creates an instance of FileItem
         * @param {FileUploader} uploader
         * @param {File|HTMLInputElement|Object} some
         * @param {Object} options
         * @constructor
         */
        constructor(uploader, some, options) {
            var isInput = isElement(some);
            var input = isInput ? element(some) : null;
            var file = !isInput ? some : null;

            extend(this, {
                url: uploader.url,
                alias: uploader.alias,
                headers: copy(uploader.headers),
                formData: copy(uploader.formData),
                removeAfterUpload: uploader.removeAfterUpload,
                withCredentials: uploader.withCredentials,
                disableMultipart: uploader.disableMultipart,
                method: uploader.method
            }, options, {
                uploader: uploader,
                file: new FileLikeObject(some),
                isReady: false,
                isUploading: false,
                isUploaded: false,
                isSuccess: false,
                isCancel: false,
                isError: false,
                progress: 0,
                index: null,
                _file: file,
                _input: input
            });

            if (input) this._replaceNode(input);
        }
        /**********************
         * PUBLIC
         **********************/
        /**
         * Uploads a FileItem
         */
        upload() {
            try {
                this.uploader.uploadItem(this);
            } catch(e) {
                this.uploader._onCompleteItem(this, '', 0, []);
                this.uploader._onErrorItem(this, '', 0, []);
            }
        }
        /**
         * Cancels uploading of FileItem
         */
        cancel() {
            this.uploader.cancelItem(this);
        }
        /**
         * Removes a FileItem
         */
        remove() {
            this.uploader.removeFromQueue(this);
        }
        /**
         * Callback
         * @private
         */
        onBeforeUpload() {
        }
        /**
         * Callback
         * @param {Number} progress
         * @private
         */
        onProgress(progress) {
        }
        /**
         * Callback
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         */
        onSuccess(response, status, headers) {
        }
        /**
         * Callback
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         */
        onError(response, status, headers) {
        }
        /**
         * Callback
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         */
        onCancel(response, status, headers) {
        }
        /**
         * Callback
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         */
        onComplete(response, status, headers) {
        }
        /**********************
         * PRIVATE
         **********************/
        /**
         * Inner callback
         */
        _onBeforeUpload() {
            this.isReady = true;
            this.isUploading = false;
            this.isUploaded = false;
            this.isSuccess = false;
            this.isCancel = false;
            this.isError = false;
            this.progress = 0;
            this.onBeforeUpload();
        }
        /**
         * Inner callback
         * @param {Number} progress
         * @private
         */
        _onProgress(progress) {
            this.progress = progress;
            this.onProgress(progress);
        }
        /**
         * Inner callback
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         * @private
         */
        _onSuccess(response, status, headers) {
            this.isReady = false;
            this.isUploading = false;
            this.isUploaded = true;
            this.isSuccess = true;
            this.isCancel = false;
            this.isError = false;
            this.progress = 100;
            this.index = null;
            this.onSuccess(response, status, headers);
        }
        /**
         * Inner callback
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         * @private
         */
        _onError(response, status, headers) {
            this.isReady = false;
            this.isUploading = false;
            this.isUploaded = true;
            this.isSuccess = false;
            this.isCancel = false;
            this.isError = true;
            this.progress = 0;
            this.index = null;
            this.onError(response, status, headers);
        }
        /**
         * Inner callback
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         * @private
         */
        _onCancel(response, status, headers) {
            this.isReady = false;
            this.isUploading = false;
            this.isUploaded = false;
            this.isSuccess = false;
            this.isCancel = true;
            this.isError = false;
            this.progress = 0;
            this.index = null;
            this.onCancel(response, status, headers);
        }
        /**
         * Inner callback
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         * @private
         */
        _onComplete(response, status, headers) {
            this.onComplete(response, status, headers);
            if(this.removeAfterUpload) this.remove();
        }
        /**
         * Destroys a FileItem
         */
        _destroy() {
            if(this._input) this._input.remove();
            if(this._form) this._form.remove();
            delete this._form;
            delete this._input;
        }
        /**
         * Prepares to uploading
         * @private
         */
        _prepareToUploading() {
            this.index = this.index || ++this.uploader._nextIndex;
            this.isReady = true;
        }
        /**
         * Replaces input element on his clone
         * @param {JQLite|jQuery} input
         * @private
         */
        _replaceNode(input) {
            var clone = $compile(input.clone())(input.scope());
            clone.prop('value', null); // FF fix
            input.css('display', 'none');
            input.after(clone); // remove jquery dependency
        }
    }
}


__identity.$inject = [
    '$compile',
    'FileLikeObject'
];