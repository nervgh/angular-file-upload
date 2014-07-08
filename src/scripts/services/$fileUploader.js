/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.5.7, 2014-05-23
 */
app.factory('$fileUploader', ['$compile', '$rootScope', '$http', '$window', function($compile, $rootScope, $http, $window) {
    'use strict';

    /**
     * Creates a uploader
     * @param {Object} params
     * @constructor
     */
    function Uploader(params) {
        angular.extend(this, {
            scope: $rootScope,
            url: '/',
            alias: 'file',
            queue: [],
            headers: {},
            progress: null,
            autoUpload: false,
            removeAfterUpload: false,
            method: 'POST',
            filters: [],
            formData: [],
            isUploading: false,
            queueLimit: Number.MAX_VALUE,
            withCredentials: false,
            _nextIndex: 0,
            _timestamp: Date.now()
        }, params);

        // add default filters
        this.filters.unshift(this._queueLimitFilter);
        this.filters.unshift(this._emptyFileFilter);

        this.scope.$on('file:add', function(event, items, options) {
            event.stopPropagation();
            this.addToQueue(items, options);
        }.bind(this));

        this.bind('beforeupload', Item.prototype._beforeupload);
        this.bind('in:progress', Item.prototype._progress);
        this.bind('in:success', Item.prototype._success);
        this.bind('in:cancel', Item.prototype._cancel);
        this.bind('in:error', Item.prototype._error);
        this.bind('in:complete', Item.prototype._complete);
        this.bind('in:progress', this._progress);
        this.bind('in:complete', this._complete);
    }

    Uploader.prototype = {
        /**
         * Link to the constructor
         */
        constructor: Uploader,

        /**
         * Returns "true" if item is DOMElement or a file with size > 0
         * @param {File|Input} item
         * @returns {Boolean}
         * @private
         */
        _emptyFileFilter: function(item) {
            return angular.isElement(item) ? true : !!item.size;
        },

        /**
         * Returns "true" if the limit has not been reached
         * @returns {Boolean}
         * @private
         */
        _queueLimitFilter: function() {
            return this.queue.length < this.queueLimit;
        },

        /**
         * Registers a event handler
         * @param {String} event
         * @param {Function} handler
         * @return {Function} unsubscribe function
         */
        bind: function(event, handler) {
            return this.scope.$on(this._timestamp + ':' + event, handler.bind(this));
        },

        /**
         * Triggers events
         * @param {String} event
         * @param {...*} [some]
         */
        trigger: function(event, some) {
            arguments[0] = this._timestamp + ':' + event;
            this.scope.$broadcast.apply(this.scope, arguments);
        },

        /**
         * Checks a support the html5 uploader
         * @returns {Boolean}
         * @readonly
         */
        isHTML5: !!($window.File && $window.FormData),

        /**
         * Adds items to the queue
         * @param {FileList|File|HTMLInputElement} items
         * @param {Object} [options]
         */
        addToQueue: function(items, options) {
            var length = this.queue.length;
            var list = 'length' in items ? items : [items];

            angular.forEach(list, function(file) {
                // check a [File|HTMLInputElement]
                var isValid = !this.filters.length ? true : this.filters.every(function(filter) {
                    return filter.call(this, file);
                }, this);

                // create new item
                var item = new Item(angular.extend({
                    url: this.url,
                    alias: this.alias,
                    headers: angular.copy(this.headers),
                    formData: angular.copy(this.formData),
                    removeAfterUpload: this.removeAfterUpload,
                    withCredentials: this.withCredentials,
                    method: this.method,
                    uploader: this,
                    file: file
                }, options));

                if(isValid) {
                    this.queue.push(item);
                    this.trigger('afteraddingfile', item);
                } else {
                    this.trigger('whenaddingfilefailed', item);
                }
            }, this);

            if(this.queue.length !== length) {
                this.trigger('afteraddingall', this.queue);
                this.progress = this._getTotalProgress();
            }

            this._render();
            this.autoUpload && this.uploadAll();
        },

        /**
         * Remove items from the queue. Remove last: index = -1
         * @param {Item|Number} value
         */
        removeFromQueue: function(value) {
            var index = this.getIndexOfItem(value);
            var item = this.queue[index];
            if (item.cancel) item.cancel();
            if (item._destroy) item._destroy();
            this.queue.splice(index, 1);
            this.progress = this._getTotalProgress();
            this.trigger('afterremovingfile', item);
        },

        /**
         * Clears the queue
         */
        clearQueue: function() {
            while(this.queue.length) {
                this.queue[this.queue.length - 1].remove();
            }
        },

        /**
         * Uploads a item from the queue
         * @param {Item|Number} value
         */
        uploadItem: function(value) {
            var index = this.getIndexOfItem(value);
            var item = this.queue[index];
            var transport = this.isHTML5 ? '_xhrTransport' : '_iframeTransport';

            item.index = item.index || this._nextIndex++;
            item.isReady = true;

            if(this.isUploading) return;

            this.isUploading = true;
            this[transport](item);
        },

        /**
         * Cancels uploading of item from the queue
         * @param {Item|Number} value
         */
        cancelItem: function(value) {
            var index = this.getIndexOfItem(value);
            var item = this.queue[index];
            var prop = this.isHTML5 ? '_xhr' : '_form';
            if (item.isUploading && item[prop]) item[prop].abort();
        },

        /**
         * Uploads all not uploaded items of queue
         */
        uploadAll: function() {
            var items = this.getNotUploadedItems().filter(function(item) {
                return !item.isUploading;
            });
            items.forEach(function(item) {
                item.index = item.index || this._nextIndex++;
                item.isReady = true;
            }, this);
            items.length && items[0].upload();
        },

        /**
         * Cancels all uploads
         */
        cancelAll: function() {
            this.getNotUploadedItems().forEach(function(item) {
                this.cancelItem(item);
            }, this);
        },

        /**
         * Returns a index of item from the queue
         * @param {Item|Number} value
         * @returns {Number}
         */
        getIndexOfItem: function(value) {
            return angular.isNumber(value) ? value : this.queue.indexOf(value);
        },

        /**
         * Returns not uploaded items
         * @returns {Array}
         */
        getNotUploadedItems: function() {
            return this.queue.filter(function(item) {
                return !item.isUploaded;
            });
        },

        /**
         * Returns items ready for upload
         * @returns {Array}
         */
        getReadyItems: function() {
            return this.queue
                .filter(function(item) {
                    return item.isReady && !item.isUploading;
                })
                .sort(function(item1, item2) {
                    return item1.index - item2.index;
                });
        },

        /**
         * Updates angular scope
         * @private
         */
        _render: function() {
            if (!this.scope.$$phase) this.scope.$digest();
        },

        /**
         * Returns the total progress
         * @param {Number} [value]
         * @returns {Number}
         * @private
         */
        _getTotalProgress: function(value) {
            if(this.removeAfterUpload) {
                return value || 0;
            }

            var notUploaded = this.getNotUploadedItems().length;
            var uploaded = notUploaded ? this.queue.length - notUploaded : this.queue.length;
            var ratio = 100 / this.queue.length;
            var current = (value || 0) * ratio / 100;

            return Math.round(uploaded * ratio + current);
        },

        /**
         * The 'in:progress' handler
         * @private
         */
        _progress: function(event, item, progress) {
            var result = this._getTotalProgress(progress);
            this.trigger('progressall', result);
            this.progress = result;
            this._render();
        },

        /**
         * The 'in:complete' handler
         * @private
         */
        _complete: function() {
            var item = this.getReadyItems()[0];
            this.isUploading = false;

            if(angular.isDefined(item)) {
                item.upload();
                return;
            }

            this.trigger('completeall', this.queue);
            this.progress = this._getTotalProgress();
            this._render();
        },

        /**
         * The XMLHttpRequest transport
         * @private
         */
        _xhrTransport: function(item) {
            var xhr = item._xhr = new XMLHttpRequest();
            var form = new FormData();
            var that = this;

            this.trigger('beforeupload', item);

            item.formData.forEach(function(obj) {
                angular.forEach(obj, function(value, key) {
                    form.append(key, value);
                });
            });

            form.append(item.alias, item.file);

            xhr.upload.onprogress = function(event) {
                var progress = event.lengthComputable ? event.loaded * 100 / event.total : 0;
                that.trigger('in:progress', item, Math.round(progress));
            };

            xhr.onload = function() {
                var response = that._transformResponse(xhr.response);
                var event = that._isSuccessCode(xhr.status) ? 'success' : 'error';
                that.trigger('in:' + event, xhr, item, response);
                that.trigger('in:complete', xhr, item, response);
            };

            xhr.onerror = function() {
                that.trigger('in:error', xhr, item);
                that.trigger('in:complete', xhr, item);
            };

            xhr.onabort = function() {
                that.trigger('in:cancel', xhr, item);
                that.trigger('in:complete', xhr, item);
            };

            xhr.open(item.method, item.url, true);

            xhr.withCredentials = item.withCredentials;

            angular.forEach(item.headers, function(value, name) {
                xhr.setRequestHeader(name, value);
            });

            xhr.send(form);
        },

        /**
         * The IFrame transport
         * @private
         */
        _iframeTransport: function(item) {
            var form = angular.element('<form style="display: none;" />');
            var iframe = angular.element('<iframe name="iframeTransport' + Date.now() + '">');
            var input = item._input;
            var that = this;

            if (item._form) item._form.replaceWith(input); // remove old form
            item._form = form; // save link to new form

            this.trigger('beforeupload', item);

            input.prop('name', item.alias);

            item.formData.forEach(function(obj) {
                angular.forEach(obj, function(value, key) {
                    form.append(angular.element('<input type="hidden" name="' + key + '" value="' + value + '" />'));
                });
            });

            form.prop({
                action: item.url,
                method: 'POST',
                target: iframe.prop('name'),
                enctype: 'multipart/form-data',
                encoding: 'multipart/form-data' // old IE
            });

            iframe.bind('load', function() {
                var response;
                var xhr = {response: response, status: 200, dummy: true};
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
                try {
                    // fixed angular.contents() for iframes
                    xhr.response = iframe[0].contentDocument.body.innerHTML;
                    response = that._transformResponse(xhr.response);
                } catch (e) {}
                that.trigger('in:success', xhr, item, response);
                that.trigger('in:complete', xhr, item, response);
            });

            form.abort = function() {
                var xhr = {status: 0, dummy: true};
                iframe.unbind('load').prop('src', 'javascript:false;');
                form.replaceWith(input);
                that.trigger('in:cancel', xhr, item);
                that.trigger('in:complete', xhr, item);
            };

            input.after(form);
            form.append(input).append(iframe);

            form[0].submit();
        },

        /**
         * Checks whether upload successful
         * @param {Number} status
         * @returns {Boolean}
         * @private
         */
        _isSuccessCode: function(status) {
            return (status >= 200 && status < 300) || status === 304;
        },

        /**
         * Transforms the server response
         * @param {*} response
         * @returns {*}
         * @private
         */
        _transformResponse: function(response) {
            $http.defaults.transformResponse.forEach(function(transformFn) {
                response = transformFn(response);
            });
            return response;
        }
    };


    /**
     * Create a item
     * @param {Object} [params]
     * @constructor
     */
    function Item(params) {
        // fix for old browsers
        if(!Uploader.prototype.isHTML5) {
            var input = angular.element(params.file);
            var clone = $compile(input.clone())(params.uploader.scope);
            var value = input.val();

            params.file = {
                lastModifiedDate: null,
                size: null,
                type: 'like/' + value.slice(value.lastIndexOf('.') + 1).toLowerCase(),
                name: value.slice(value.lastIndexOf('/') + value.lastIndexOf('\\') + 2)
            };

            params._input = input;
            clone.prop('value', null); // FF fix
            input.css('display', 'none').after(clone); // remove jquery dependency
        }

        angular.extend(this, {
            isReady: false,
            isUploading: false,
            isUploaded: false,
            isSuccess: false,
            isCancel: false,
            isError: false,
            progress: null,
            index: null
        }, params);
    }


    Item.prototype = {
        /**
         * Link to the constructor
         */
        constructor: Item,
        /**
         * Removes a item
         */
        remove: function() {
            this.uploader.removeFromQueue(this);
        },
        /**
         * Uploads a item
         */
        upload: function() {
            this.uploader.uploadItem(this);
        },
        /**
         * Cancels uploading
         */
        cancel: function() {
            this.uploader.cancelItem(this);
        },
        /**
         * Destroys form and input
         * @private
         */
        _destroy: function() {
            if (this._form) this._form.remove();
            if (this._input) this._input.remove();
            delete this._form;
            delete this._input;
        },
        /**
         * The 'beforeupload' handler
         * @param {Object} event
         * @param {Item} item
         * @private
         */
        _beforeupload: function(event, item) {
            item.isReady = true;
            item.isUploading = true;
            item.isUploaded = false;
            item.isSuccess = false;
            item.isCancel = false;
            item.isError = false;
            item.progress = 0;
        },
        /**
         * The 'in:progress' handler
         * @param {Object} event
         * @param {Item} item
         * @param {Number} progress
         * @private
         */
        _progress: function(event, item, progress) {
            item.progress = progress;
            item.uploader.trigger('progress', item, progress);
        },
        /**
         * The 'in:success' handler
         * @param {Object} event
         * @param {XMLHttpRequest} xhr
         * @param {Item} item
         * @param {*} response
         * @private
         */
        _success: function(event, xhr, item, response) {
            item.isReady = false;
            item.isUploading = false;
            item.isUploaded = true;
            item.isSuccess = true;
            item.isCancel = false;
            item.isError = false;
            item.progress = 100;
            item.index = null;
            item.uploader.trigger('success', xhr, item, response);
        },
        /**
         * The 'in:cancel' handler
         * @param {Object} event
         * @param {XMLHttpRequest} xhr
         * @param {Item} item
         * @private
         */
        _cancel: function(event, xhr, item) {
            item.isReady = false;
            item.isUploading = false;
            item.isUploaded = false;
            item.isSuccess = false;
            item.isCancel = true;
            item.isError = false;
            item.progress = 0;
            item.index = null;
            item.uploader.trigger('cancel', xhr, item);
        },
        /**
         * The 'in:error' handler
         * @param {Object} event
         * @param {XMLHttpRequest} xhr
         * @param {Item} item
         * @param {*} response
         * @private
         */
        _error: function(event, xhr, item, response) {
            item.isReady = false;
            item.isUploading = false;
            item.isUploaded = true;
            item.isSuccess = false;
            item.isCancel = false;
            item.isError = true;
            item.progress = 100;
            item.index = null;
            item.uploader.trigger('error', xhr, item, response);
        },
        /**
         * The 'in:complete' handler
         * @param {Object} event
         * @param {XMLHttpRequest} xhr
         * @param {Item} item
         * @param {*} response
         * @private
         */
        _complete: function(event, xhr, item, response) {
            item.uploader.trigger('complete', xhr, item, response);
            item.removeAfterUpload && item.remove();
        }
    };

    return {
        create: function(params) {
            return new Uploader(params);
        },
        isHTML5: Uploader.prototype.isHTML5
    };
}])
