/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.8.9, 2013-11-18
 */

app.factory('$fileUploader', [ '$compile', '$rootScope', '$http', '$window', function ($compile, $rootScope, $http, $window) {
    'use strict';

    function Uploader(params) {
        angular.extend(this, {
            scope: $rootScope,
            url: '/',
            alias: 'file',
            queue: [],
            uploadingQueue: [],
            headers: {},
            progress: null,
            autoUpload: false,
            removeAfterUpload: false,
            filters: [],
            formData: [],
            isUploading: false,
            _timestamp: Date.now()
        }, params);

        // add the base filter
        this.filters.unshift(this._filter);

        this.scope.$on('file:add', function (event, items, options) {
            event.stopPropagation();
            this.addToQueue(items, options);
        }.bind(this));

        this.bind('beforeupload', Item.prototype._beforeupload);
        this.bind('in:progress', Item.prototype._progress);
        this.bind('in:success', Item.prototype._success);
        this.bind('in:error', Item.prototype._error);
        this.bind('in:complete', Item.prototype._complete);
        this.bind('changedqueue', this._changedQueue);
        this.bind('in:progress', this._progress);
        this.bind('in:complete', this._complete);
    }

    Uploader.prototype = {

        /**
         * The base filter. If returns "true" an item will be added to the queue
         * @param {File|Input} item
         * @returns {boolean}
         */
        _filter: function (item) {
            return angular.isElement(item) ? true : !!item.size;
        },

        /**
         * Registers a event handler
         * @param {String} event
         * @param {Function} handler
         */
        bind: function (event, handler) {
            this.scope.$on(this._timestamp + ':' + event, handler.bind(this));
            return this;
        },

        /**
         * Triggers events
         * @param {String} event
         * @param {...*} [some]
         */
        trigger: function (event, some) {
            var params = Array.prototype.slice.call(arguments, 1);
            params.unshift(this._timestamp + ':' + event);
            this.scope.$broadcast.apply(this.scope, params);
            return this;
        },

        /**
         * Checks a support the html5 uploader
         * @returns {Boolean}
         */
        hasHTML5: !!($window.File && $window.FormData),

        /**
         * Adds items to the queue
         * @param {FileList|File|Input} items
         * @param {Object} [options]
         */
        addToQueue: function (items, options) {
            var length = this.queue.length;

            angular.forEach('length' in items ? items : [ items ], function (item) {
                var isValid = !this.filters.length ? true : this.filters.every(function (filter) {
                    return filter.call(this, item);
                }, this);

                if (isValid) {
                    item = new Item(angular.extend({
                        url: this.url,
                        alias: this.alias,
                        headers: angular.copy(this.headers),
                        formData: angular.copy(this.formData),
                        removeAfterUpload: this.removeAfterUpload,
                        uploader: this,
                        file: item
                    }, options));

                    this.queue.push(item);
                    this.trigger('afteraddingfile', item);
                }
            }, this);

            if (this.queue.length !== length) {
                this.trigger('afteraddingall', this.queue);
                this.trigger('changedqueue', this.queue);
            }
            this.autoUpload && this.uploadAll();
            return this;
        },

        /**
         * Remove items from the queue. Remove last: index = -1
         * @param {Item|Number} value
         */
        removeFromQueue: function (value) {
            var index = angular.isObject(value) ? this.getIndexOfItem(value) : value;
            var item = this.queue.splice(index, 1)[ 0 ];
            ( item.file && item.file._form ) && item.file._form.remove();
            this.trigger('changedqueue', item);
            return this;
        },

        /**
         * Clears the queue
         */
        clearQueue: function () {
            angular.forEach(this.queue, function (item) {
                item.file._form && item.file._form.remove();
            }, this);
            this.queue.length = 0;
            this.trigger('changedqueue', this.queue);
            return this;
        },

        /**
         * Returns a index of item from the queue
         * @param item
         * @returns {Number}
         */
        getIndexOfItem: function (item) {
            return this.queue.indexOf(item);
        },

        /**
         * Returns not uploaded items
         * @returns {Array}
         */
        getNotUploadedItems: function () {
            return this.queue.filter(function (item) {
                return !item.isUploaded;
            });
        },

        /**
         * Upload first file from uploadingQueue
         */

        _upload: function() {
            if (!this.isUploading) {
                var item = this.uploadingQueue[ 0 ];
                if (item) {
                    var transport = item.file._form ? '_iframeTransport' : '_xhrTransport';
                    this.isUploading = true;
                    this.uploadingQueue.shift();
                    this[ transport ](item);
                }
            }
        },

        /**
         * Add item to the uploading queue
         * @param {Item|Number} value
         */
        uploadItem: function (value) {
            if (!(value.isUploaded || value.isUploading) &&
                this.uploadingQueue.indexOf(value) == -1) {
                this.uploadingQueue.push(value);
                this._upload();
            }
            return this;
        },

        /**
         * Uploads all items from queue to uploading queue
         */
        uploadAll: function () {
            angular.forEach(this.queue, function(value) {
                this.uploadItem(value);
            });
            this._upload();
            return this;
        },

        /**
         * Returns the total progress
         * @param {Number} [value]
         * @returns {Number}
         */
        _getTotalProgress: function (value) {
            if (this.removeAfterUpload) {
                return value || 0;
            }

            var notUploaded = this.getNotUploadedItems().length;
            var uploaded = notUploaded ? this.queue.length - notUploaded : this.queue.length;
            var ratio = 100 / this.queue.length;
            var current = ( value || 0 ) * ratio / 100;

            return Math.round(uploaded * ratio + current);
        },

        /**
         * The 'in:progress' handler
         */
        _progress: function (event, item, progress) {
            var result = this._getTotalProgress(progress);
            this.progress = result;
            this.trigger('progressall', result);
            this.scope.$$phase || this.scope.$apply();
        },

        /**
         * The 'in:complete' handler
         */
        _complete: function () {
            this.isUploading = false;
            this._upload();
            this.isUploading || this.trigger('completeall', this.queue);
            this.isUploading && (this.scope.$$phase || this.scope.$apply());
        },

        /**
         * The 'changedqueue' handler
         */
        _changedQueue: function () {
            this.progress = this._getTotalProgress();
            this.scope.$$phase || this.scope.$apply();
        },

        /**
         * The XMLHttpRequest transport
         */
        _xhrTransport: function (item) {
            var xhr = new XMLHttpRequest();
            var form = new FormData();
            var that = this;

            this.trigger('beforeupload', item);

            angular.forEach(item.formData, function(obj) {
                angular.forEach(obj, function(value, key) {
                    form.append(key, value);
                });
            });

            form.append(item.alias, item.file);

            xhr.upload.addEventListener('progress', function (event) {
                var progress = event.lengthComputable ? event.loaded * 100 / event.total : 0;
                that.trigger('in:progress', item, Math.round(progress));
            }, false);

            xhr.addEventListener('load', function () {
                var response = that._transformResponse(xhr.response);
                var isSuccess = (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304;
                var event = isSuccess ? 'in:success' : 'in:error';
                that.trigger(event, xhr, item, response);
                that.trigger('in:complete', xhr, item, response);
            }, false);

            xhr.addEventListener('error', function () {
                that.trigger('in:error', xhr, item);
                that.trigger('in:complete', xhr, item);
            }, false);

            xhr.addEventListener('abort', function () {
                that.trigger('in:complete', xhr, item);
            }, false);

            xhr.open(item.method, item.url, true);

            angular.forEach(item.headers, function (value, name) {
                xhr.setRequestHeader(name, value);
            });

            xhr.send(form);
        },

        /**
         * The IFrame transport
         */
        _iframeTransport: function (item) {
            var form = item.file._form;
            var iframe = form.find('iframe');
            var input = form.find('input');
            var that = this;

            this.trigger('beforeupload', item);

            // remove all but the INPUT file type
            angular.forEach(input, function(element) {
                element.type !== 'file' && angular.element(element).remove(); // prevent memory leaks
            });

            input.prop('name', item.alias);

            angular.forEach(item.formData, function(obj) {
                angular.forEach(obj, function(value, key) {
                    form.append(angular.element('<input type="hidden" name="' + key + '" value="' + value + '" />'));
                });
            });

            form.prop({
                action: item.url,
                method: item.method,
                target: iframe.prop('name'),
                enctype: 'multipart/form-data',
                encoding: 'multipart/form-data' // old IE
            });

            iframe.unbind().bind('load', function () {
                var xhr = { response: iframe.contents()[ 0 ].body.innerHTML, status: 200, dummy: true };
                var response = that._transformResponse(xhr.response);
                that.trigger('in:complete', xhr, item, response);
            });

            form[ 0 ].submit();
        },

        /**
         * Transforms the server response
         */
        _transformResponse: function (response) {
            angular.forEach($http.defaults.transformResponse, function (transformFn) {
                response = transformFn(response);
            });
            return response;
        }
    };


    // item of queue
    function Item(params) {
        // fix for old browsers
        if (angular.isElement(params.file)) {
            var input = angular.element(params.file);
            var clone = $compile(input.clone())(params.uploader.scope);
            var form = angular.element('<form style="display: none;" />');
            var iframe = angular.element('<iframe name="iframeTransport' + Date.now() + '">');
            var value = input.val();

            params.file = {
                lastModifiedDate: null,
                size: null,
                type: 'like/' + value.replace(/^.+\.(?!\.)|.*/, ''),
                name: value.match(/[^\\]+$/)[ 0 ],
                _form: form
            };

            input.after(clone).after(form);
            form.append(input).append(iframe);
        }

        angular.extend(this, {
            progress: null,
            isUploading: false,
            isUploaded: false,
            method: 'POST'
        }, params);
    }

    Item.prototype = {
        remove: function () {
            this.uploader.removeFromQueue(this);
        },
        upload: function () {
            this.uploader.uploadItem(this);
        },
        _beforeupload: function (event, item) {
            item.isUploaded = false;
            item.isUploading = true;
            item.progress = null;
        },
        _progress: function (event, item, progress) {
            item.progress = progress;
            item.uploader.trigger('progress', item, progress);
        },
        _success: function (event, xhr, item, response) {
            item.isUploaded = true;
            item.isUploading = false;
            item.uploader.trigger('success', xhr, item, response);
        },
        _error: function (event, xhr, item, response) {
            item.isUploaded = true;
            item.isUploading = false;
            item.uploader.trigger('error', xhr, item, response);
        },
        _complete: function (event, xhr, item, response) {
            item.isUploaded = true;
            item.isUploading = false;
            item.uploader.trigger('complete', xhr, item, response);
            item.removeAfterUpload && item.remove();
        }
    };

    return {
        create: function (params) {
            return new Uploader(params);
        },
        hasHTML5: Uploader.prototype.hasHTML5
    };
}])