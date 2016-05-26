'use strict';


import CONFIG from './../config.json';


let {
    copy,
    extend,
    forEach,
    isObject,
    isNumber,
    isDefined,
    isArray,
    element
    } = angular;


export default function __identity(fileUploaderOptions, $rootScope, $http, $window, $timeout, FileLikeObject, FileItem) {
    
    
    let {
        File,
        FormData
        } = $window;
    
    
    class FileUploader {
        /**********************
         * PUBLIC
         **********************/
        /**
         * Creates an instance of FileUploader
         * @param {Object} [options]
         * @constructor
         */
        constructor(options) {
            var settings = copy(fileUploaderOptions);
            
            extend(this, settings, options, {
                isUploading: false,
                _nextIndex: 0,
                _failFilterIndex: -1,
                _directives: {select: [], drop: [], over: []}
            });

            // add default filters
            this.filters.unshift({name: 'queueLimit', fn: this._queueLimitFilter});
            this.filters.unshift({name: 'folder', fn: this._folderFilter});
        }
        /**
         * Adds items to the queue
         * @param {File|HTMLInputElement|Object|FileList|Array<Object>} files
         * @param {Object} [options]
         * @param {Array<Function>|String} filters
         */
        addToQueue(files, options, filters) {
            var list = this.isArrayLikeObject(files) ? files: [files];
            var arrayOfFilters = this._getFilters(filters);
            var count = this.queue.length;
            var addedFileItems = [];

            forEach(list, (some /*{File|HTMLInputElement|Object}*/) => {
                var temp = new FileLikeObject(some);

                if (this._isValidFile(temp, arrayOfFilters, options)) {
                    var fileItem = new FileItem(this, some, options);
                    addedFileItems.push(fileItem);
                    this.queue.push(fileItem);
                    this._onAfterAddingFile(fileItem);
                } else {
                    var filter = arrayOfFilters[this._failFilterIndex];
                    this._onWhenAddingFileFailed(temp, filter, options);
                }
            });

            if(this.queue.length !== count) {
                this._onAfterAddingAll(addedFileItems);
                this.progress = this._getTotalProgress();
            }

            this._render();
            if (this.autoUpload) this.uploadAll();
        }
        /**
         * Remove items from the queue. Remove last: index = -1
         * @param {FileItem|Number} value
         */
        removeFromQueue(value) {
            var index = this.getIndexOfItem(value);
            var item = this.queue[index];
            if(item.isUploading) item.cancel();
            this.queue.splice(index, 1);
            item._destroy();
            this.progress = this._getTotalProgress();
        }
        /**
         * Clears the queue
         */
        clearQueue() {
            while(this.queue.length) {
                this.queue[0].remove();
            }
            this.progress = 0;
        }
        /**
         * Uploads a item from the queue
         * @param {FileItem|Number} value
         */
        uploadItem(value) {
            var index = this.getIndexOfItem(value);
            var item = this.queue[index];
            var transport = this.isHTML5 ? '_xhrTransport' : '_iframeTransport';

            item._prepareToUploading();
            if(this.isUploading) return;

            this._onBeforeUploadItem(item);
            if (item.isCancel) return;

            item.isUploading = true;
            this.isUploading = true;
            this[transport](item);
            this._render();
        }
        /**
         * Cancels uploading of item from the queue
         * @param {FileItem|Number} value
         */
        cancelItem(value) {
            var index = this.getIndexOfItem(value);
            var item = this.queue[index];
            var prop = this.isHTML5 ? '_xhr' : '_form';
            if (!item) return;
            item.isCancel = true;
            if(item.isUploading) {
                // It will call this._onCancelItem() & this._onCompleteItem() asynchronously
                item[prop].abort();
            } else {
                let dummy = [undefined, 0, {}];
                let onNextTick = () => {
                    this._onCancelItem(item, ...dummy);
                    this._onCompleteItem(item, ...dummy);
                };
                $timeout(onNextTick); // Trigger callbacks asynchronously (setImmediate emulation)
            }
        }
        /**
         * Uploads all not uploaded items of queue
         */
        uploadAll() {
            var items = this.getNotUploadedItems().filter(item => !item.isUploading);
            if(!items.length) return;

            forEach(items, item => item._prepareToUploading());
            items[0].upload();
        }
        /**
         * Cancels all uploads
         */
        cancelAll() {
            var items = this.getNotUploadedItems();
            forEach(items, item => item.cancel());
        }
        /**
         * Returns "true" if value an instance of File
         * @param {*} value
         * @returns {Boolean}
         * @private
         */
        isFile(value) {
            return this.constructor.isFile(value);
        }
        /**
         * Returns "true" if value an instance of FileLikeObject
         * @param {*} value
         * @returns {Boolean}
         * @private
         */
        isFileLikeObject(value) {
            return this.constructor.isFileLikeObject(value);
        }
        /**
         * Returns "true" if value is array like object
         * @param {*} value
         * @returns {Boolean}
         */
        isArrayLikeObject(value) {
            return this.constructor.isArrayLikeObject(value);
        }
        /**
         * Returns a index of item from the queue
         * @param {Item|Number} value
         * @returns {Number}
         */
        getIndexOfItem(value) {
            return isNumber(value) ? value : this.queue.indexOf(value);
        }
        /**
         * Returns not uploaded items
         * @returns {Array}
         */
        getNotUploadedItems() {
            return this.queue.filter(item => !item.isUploaded);
        }
        /**
         * Returns items ready for upload
         * @returns {Array}
         */
        getReadyItems() {
            return this.queue
                .filter(item => (item.isReady && !item.isUploading))
                .sort((item1, item2) => item1.index - item2.index);
        }
        /**
         * Destroys instance of FileUploader
         */
        destroy() {
            forEach(this._directives, (key) => {
                forEach(this._directives[key], (object) => {
                    object.destroy();
                });
            });
        }
        /**
         * Callback
         * @param {Array} fileItems
         */
        onAfterAddingAll(fileItems) {
        }
        /**
         * Callback
         * @param {FileItem} fileItem
         */
        onAfterAddingFile(fileItem) {
        }
        /**
         * Callback
         * @param {File|Object} item
         * @param {Object} filter
         * @param {Object} options
         */
        onWhenAddingFileFailed(item, filter, options) {
        }
        /**
         * Callback
         * @param {FileItem} fileItem
         */
        onBeforeUploadItem(fileItem) {
        }
        /**
         * Callback
         * @param {FileItem} fileItem
         * @param {Number} progress
         */
        onProgressItem(fileItem, progress) {
        }
        /**
         * Callback
         * @param {Number} progress
         */
        onProgressAll(progress) {
        }
        /**
         * Callback
         * @param {FileItem} item
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         */
        onSuccessItem(item, response, status, headers) {
        }
        /**
         * Callback
         * @param {FileItem} item
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         */
        onErrorItem(item, response, status, headers) {
        }
        /**
         * Callback
         * @param {FileItem} item
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         */
        onCancelItem(item, response, status, headers) {
        }
        /**
         * Callback
         * @param {FileItem} item
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         */
        onCompleteItem(item, response, status, headers) {
        }
        /**
         * Callback
         */
        onCompleteAll() {
        }
        /**********************
         * PRIVATE
         **********************/
        /**
         * Returns the total progress
         * @param {Number} [value]
         * @returns {Number}
         * @private
         */
        _getTotalProgress(value) {
            if(this.removeAfterUpload) return value || 0;

            var notUploaded = this.getNotUploadedItems().length;
            var uploaded = notUploaded ? this.queue.length - notUploaded : this.queue.length;
            var ratio = 100 / this.queue.length;
            var current = (value || 0) * ratio / 100;

            return Math.round(uploaded * ratio + current);
        }
        /**
         * Returns array of filters
         * @param {Array<Function>|String} filters
         * @returns {Array<Function>}
         * @private
         */
        _getFilters(filters) {
            if(!filters) return this.filters;
            if(isArray(filters)) return filters;
            var names = filters.match(/[^\s,]+/g);
            return this.filters
                .filter(filter => names.indexOf(filter.name) !== -1);
        }
        /**
         * Updates html
         * @private
         */
        _render() {
            if(!$rootScope.$$phase) $rootScope.$apply();
        }
        /**
         * Returns "true" if item is a file (not folder)
         * @param {File|FileLikeObject} item
         * @returns {Boolean}
         * @private
         */
        _folderFilter(item) {
            return !!(item.size || item.type);
        }
        /**
         * Returns "true" if the limit has not been reached
         * @returns {Boolean}
         * @private
         */
        _queueLimitFilter() {
            return this.queue.length < this.queueLimit;
        }
        /**
         * Returns "true" if file pass all filters
         * @param {File|Object} file
         * @param {Array<Function>} filters
         * @param {Object} options
         * @returns {Boolean}
         * @private
         */
        _isValidFile(file, filters, options) {
            this._failFilterIndex = -1;
            return !filters.length ? true : filters.every((filter) => {
                this._failFilterIndex++;
                return filter.fn.call(this, file, options);
            });
        }
        /**
         * Checks whether upload successful
         * @param {Number} status
         * @returns {Boolean}
         * @private
         */
        _isSuccessCode(status) {
            return (status >= 200 && status < 300) || status === 304;
        }
        /**
         * Transforms the server response
         * @param {*} response
         * @param {Object} headers
         * @returns {*}
         * @private
         */
        _transformResponse(response, headers) {
            var headersGetter = this._headersGetter(headers);
            forEach($http.defaults.transformResponse, (transformFn) => {
                response = transformFn(response, headersGetter);
            });
            return response;
        }
        /**
         * Parsed response headers
         * @param headers
         * @returns {Object}
         * @see https://github.com/angular/angular.js/blob/master/src/ng/http.js
         * @private
         */
        _parseHeaders(headers) {
            var parsed = {}, key, val, i;

            if(!headers) return parsed;

            forEach(headers.split('\n'), (line) => {
                i = line.indexOf(':');
                key = line.slice(0, i).trim().toLowerCase();
                val = line.slice(i + 1).trim();

                if(key) {
                    parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
                }
            });

            return parsed;
        }
        /**
         * Returns function that returns headers
         * @param {Object} parsedHeaders
         * @returns {Function}
         * @private
         */
        _headersGetter(parsedHeaders) {
            return (name) => {
                if(name) {
                    return parsedHeaders[name.toLowerCase()] || null;
                }
                return parsedHeaders;
            };
        }
        /**
         * The XMLHttpRequest transport
         * @param {FileItem} item
         * @private
         */
        _xhrTransport(item) {
            var xhr = item._xhr = new XMLHttpRequest();
            var sendable;

            if (!item.disableMultipart) {
                sendable = new FormData();
                forEach(item.formData, (obj) => {
                    forEach(obj, (value, key) => {
                        sendable.append(key, value);
                    });
                });

                sendable.append(item.alias, item._file, item.file.name);
            }
            else {
                sendable = item._file;
            }

            if(typeof(item._file.size) != 'number') {
                throw new TypeError('The file specified is no longer valid');
            }

            xhr.upload.onprogress = (event) => {
                var progress = Math.round(event.lengthComputable ? event.loaded * 100 / event.total : 0);
                this._onProgressItem(item, progress);
            };

            xhr.onload = () => {
                var headers = this._parseHeaders(xhr.getAllResponseHeaders());
                var response = this._transformResponse(xhr.response, headers);
                var gist = this._isSuccessCode(xhr.status) ? 'Success' : 'Error';
                var method = '_on' + gist + 'Item';
                this[method](item, response, xhr.status, headers);
                this._onCompleteItem(item, response, xhr.status, headers);
            };

            xhr.onerror = () => {
                var headers = this._parseHeaders(xhr.getAllResponseHeaders());
                var response = this._transformResponse(xhr.response, headers);
                this._onErrorItem(item, response, xhr.status, headers);
                this._onCompleteItem(item, response, xhr.status, headers);
            };

            xhr.onabort = () => {
                var headers = this._parseHeaders(xhr.getAllResponseHeaders());
                var response = this._transformResponse(xhr.response, headers);
                this._onCancelItem(item, response, xhr.status, headers);
                this._onCompleteItem(item, response, xhr.status, headers);
            };

            xhr.open(item.method, item.url, true);

            xhr.withCredentials = item.withCredentials;

            forEach(item.headers, (value, name) => {
                xhr.setRequestHeader(name, value);
            });

            xhr.send(sendable);
        }
        /**
         * The IFrame transport
         * @param {FileItem} item
         * @private
         */
        _iframeTransport(item) {
            var form = element('<form style="display: none;" />');
            var iframe = element('<iframe name="iframeTransport' + Date.now() + '">');
            var input = item._input;

            if(item._form) item._form.replaceWith(input); // remove old form
            item._form = form; // save link to new form

            input.prop('name', item.alias);

            forEach(item.formData, (obj) => {
                forEach(obj, (value, key) => {
                    var element_ = element('<input type="hidden" name="' + key + '" />');
                    element_.val(value);
                    form.append(element_);
                });
            });

            form.prop({
                action: item.url,
                method: 'POST',
                target: iframe.prop('name'),
                enctype: 'multipart/form-data',
                encoding: 'multipart/form-data' // old IE
            });

            iframe.bind('load', () => {
                var html = '';
                var status = 200;

                try {
                    // Fix for legacy IE browsers that loads internal error page
                    // when failed WS response received. In consequence iframe
                    // content access denied error is thrown becouse trying to
                    // access cross domain page. When such thing occurs notifying
                    // with empty response object. See more info at:
                    // http://stackoverflow.com/questions/151362/access-is-denied-error-on-accessing-iframe-document-object
                    // Note that if non standard 4xx or 5xx error code returned
                    // from WS then response content can be accessed without error
                    // but 'XHR' status becomes 200. In order to avoid confusion
                    // returning response via same 'success' event handler.

                    // fixed angular.contents() for iframes
                    html = iframe[0].contentDocument.body.innerHTML;
                } catch(e) {
                    // in case we run into the access-is-denied error or we have another error on the server side
                    // (intentional 500,40... errors), we at least say 'something went wrong' -> 500
                    status = 500;
                }

                var xhr = {response: html, status: status, dummy: true};
                var headers = {};
                var response = this._transformResponse(xhr.response, headers);

                this._onSuccessItem(item, response, xhr.status, headers);
                this._onCompleteItem(item, response, xhr.status, headers);
            });

            form.abort = () => {
                var xhr = {status: 0, dummy: true};
                var headers = {};
                var response;

                iframe.unbind('load').prop('src', 'javascript:false;');
                form.replaceWith(input);

                this._onCancelItem(item, response, xhr.status, headers);
                this._onCompleteItem(item, response, xhr.status, headers);
            };

            input.after(form);
            form.append(input).append(iframe);

            form[0].submit();
        }
        /**
         * Inner callback
         * @param {File|Object} item
         * @param {Object} filter
         * @param {Object} options
         * @private
         */
        _onWhenAddingFileFailed(item, filter, options) {
            this.onWhenAddingFileFailed(item, filter, options);
        }
        /**
         * Inner callback
         * @param {FileItem} item
         */
        _onAfterAddingFile(item) {
            this.onAfterAddingFile(item);
        }
        /**
         * Inner callback
         * @param {Array<FileItem>} items
         */
        _onAfterAddingAll(items) {
            this.onAfterAddingAll(items);
        }
        /**
         *  Inner callback
         * @param {FileItem} item
         * @private
         */
        _onBeforeUploadItem(item) {
            item._onBeforeUpload();
            this.onBeforeUploadItem(item);
        }
        /**
         * Inner callback
         * @param {FileItem} item
         * @param {Number} progress
         * @private
         */
        _onProgressItem(item, progress) {
            var total = this._getTotalProgress(progress);
            this.progress = total;
            item._onProgress(progress);
            this.onProgressItem(item, progress);
            this.onProgressAll(total);
            this._render();
        }
        /**
         * Inner callback
         * @param {FileItem} item
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         * @private
         */
        _onSuccessItem(item, response, status, headers) {
            item._onSuccess(response, status, headers);
            this.onSuccessItem(item, response, status, headers);
        }
        /**
         * Inner callback
         * @param {FileItem} item
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         * @private
         */
        _onErrorItem(item, response, status, headers) {
            item._onError(response, status, headers);
            this.onErrorItem(item, response, status, headers);
        }
        /**
         * Inner callback
         * @param {FileItem} item
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         * @private
         */
        _onCancelItem(item, response, status, headers) {
            item._onCancel(response, status, headers);
            this.onCancelItem(item, response, status, headers);
        }
        /**
         * Inner callback
         * @param {FileItem} item
         * @param {*} response
         * @param {Number} status
         * @param {Object} headers
         * @private
         */
        _onCompleteItem(item, response, status, headers) {
            item._onComplete(response, status, headers);
            this.onCompleteItem(item, response, status, headers);

            var nextItem = this.getReadyItems()[0];
            this.isUploading = false;

            if(isDefined(nextItem)) {
                nextItem.upload();
                return;
            }

            this.onCompleteAll();
            this.progress = this._getTotalProgress();
            this._render();
        }
        /**********************
         * STATIC
         **********************/
        /**
         * Returns "true" if value an instance of File
         * @param {*} value
         * @returns {Boolean}
         * @private
         */
        static isFile(value) {
            return (File && value instanceof File);
        }
        /**
         * Returns "true" if value an instance of FileLikeObject
         * @param {*} value
         * @returns {Boolean}
         * @private
         */
        static isFileLikeObject(value) {
            return value instanceof FileLikeObject;
        }
        /**
         * Returns "true" if value is array like object
         * @param {*} value
         * @returns {Boolean}
         */
        static isArrayLikeObject(value) {
            return (isObject(value) && 'length' in value);
        }
        /**
         * Inherits a target (Class_1) by a source (Class_2)
         * @param {Function} target
         * @param {Function} source
         */
        static inherit(target, source) {
            target.prototype = Object.create(source.prototype);
            target.prototype.constructor = target;
            target.super_ = source;
        }
    }


    /**********************
     * PUBLIC
     **********************/
    /**
     * Checks a support the html5 uploader
     * @returns {Boolean}
     * @readonly
     */
    FileUploader.prototype.isHTML5 = !!(File && FormData);
    /**********************
     * STATIC
     **********************/
    /**
     * @borrows FileUploader.prototype.isHTML5
     */
    FileUploader.isHTML5 = FileUploader.prototype.isHTML5;

    
    return FileUploader;
}


__identity.$inject = [
    'fileUploaderOptions', 
    '$rootScope', 
    '$http', 
    '$window',
    '$timeout',
    'FileLikeObject',
    'FileItem'
];