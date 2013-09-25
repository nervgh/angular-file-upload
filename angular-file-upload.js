(function(angular, factory) {
    if (typeof define === 'function' && define.amd) {
        define('angular-file-upload', ['angular'], function(angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function(angular) {
/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.5.1, 2012-08-31
 */
var app = angular.module('angularFileUpload', []);

/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.5.1, 2012-08-31
 */

// It is attached to an element that catches the event drop file
app.directive('ngFileDrop', function () {
    'use strict';

    return {
        // don't use drag-n-drop files in IE9, because not File API support
        link: !window.File ? angular.noop : function (scope, element, attributes) {
            element
                .bind('drop', function (event) {
                    var dataTransfer = event.dataTransfer ?
                        event.dataTransfer :
                        event.originalEvent.dataTransfer; // jQuery fix;

                    event.preventDefault();
                    event.stopPropagation();
                    scope.$broadcast('file:removeoverclass');
                    scope.$emit('file:add', dataTransfer.files, scope.$eval(attributes.ngFileDrop));
                })
                .bind('dragover', function (event) {
                    var dataTransfer = event.dataTransfer ?
                        event.dataTransfer :
                        event.originalEvent.dataTransfer; // jQuery fix;

                    event.preventDefault();
                    event.stopPropagation();
                    dataTransfer.dropEffect = 'copy';
                    scope.$broadcast('file:addoverclass');
                })
                .bind('dragleave', function () {
                    scope.$broadcast('file:removeoverclass');
                });
        }
    };
})
/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.5.1, 2012-08-31
 */

// It is attached to an element which will be assigned to a class "ng-file-over" or ng-file-over="className"
app.directive('ngFileOver', function () {
    'use strict';

    return {
        link: function (scope, element, attributes) {
            scope.$on('file:addoverclass', function () {
                element.addClass(attributes.ngFileOver || 'ng-file-over');
            });
            scope.$on('file:removeoverclass', function () {
                element.removeClass(attributes.ngFileOver || 'ng-file-over');
            });
        }
    };
});
/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.5.1, 2012-08-31
 */

// It is attached to <input type="file"> element like <ng-file-select="options">
app.directive('ngFileSelect', function () {
    'use strict';

    return {
        link: function (scope, element, attributes) {
            if (!window.File || !window.FormData) {
                element.removeAttr('multiple');
            }

            var currElement = element;
            element.bind('change', function onChange() {
                scope.$emit('file:add', this.files ? this.files : this, scope.$eval(attributes.ngFileSelect));

                var clone = currElement.clone();
                currElement.replaceWith(clone);
                clone.bind('change', onChange);
                currElement = clone;
            });
        }
    };
});
/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.2.5.1, 2012-08-31
 */

app.service('$fileUploader', [ '$compile', '$rootScope', function ($compile, $rootScope) {
    'use strict';

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
            filters: [],
            isUploading: false,
            _uploadNext: false
        }, params);

        this._observer = this.scope.$new(true);

        // add the base filter
        this.filters.unshift(this._filter);

        $rootScope.$on('file:add', function (event, items, options) {
            this.addToQueue(items, options);
            event.stopPropagation();
        }.bind(this));

        this._observer.$on('beforeupload', Item.prototype._beforeupload);
        this._observer.$on('in:progress', Item.prototype._progress);
        this._observer.$on('in:success', Item.prototype._success);
        this._observer.$on('in:error', Item.prototype._error);
        this._observer.$on('in:complete', Item.prototype._complete);

        this._observer.$on('changedqueue', this._changedQueue.bind(this));
        this._observer.$on('in:progress', this._progress.bind(this));
        this._observer.$on('in:complete', this._complete.bind(this));
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
            this._observer.$on(event, handler.bind(this));
        },

        /**
         * Checks a support the html5 uploader
         * @returns {Boolean}
         */
        hasHTML5: function () {
            return window.File && window.FormData;
        },

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
                        headers: angular.extend({}, this.headers),
                        removeAfterUpload: this.removeAfterUpload,
                        uploader: this,
                        file: item
                    }, options || {}));

                    this.queue.push(item);
                    this._observer.$emit('afteraddingfile', item);
                }
            }, this);

            if (this.queue.length !== length) {
                this._observer.$emit('afteraddingall', this.queue);
                this._observer.$emit('changedqueue', this.queue);
            }
            this.autoUpload && this.uploadAll();
        },

        /**
         * Remove items from the queue. Remove last: index = -1
         * @param {Item|Number} value
         */
        removeFromQueue: function (value) {
            var index = angular.isObject(value) ? this.getIndexOfItem(value) : value;
            var item = this.queue.splice(index, 1)[ 0 ];
            item.file._form && item.file._form.remove();
            this._observer.$emit('changedqueue', item);
        },

        /**
         * Clears the queue
         */
        clearQueue: function () {
            angular.forEach(this.queue, function (item) {
                item.file._form && item.file._form.remove();
            }, this);
            this.queue.length = 0;
            this._observer.$emit('changedqueue', this.queue);
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
         * Upload a item from the queue
         * @param {Item|Number} value
         */
        uploadItem: function (value) {
            if (this.isUploading) {
                return;
            }

            var index = angular.isObject(value) ? this.getIndexOfItem(value) : value;
            var item = this.queue[ index ];
            var transport = item.file._form ? '_iframeTransport' : '_xhrTransport';
            this.isUploading = true;
            this[ transport ](item);
        },

        uploadAll: function () {
            var item = this.getNotUploadedItems()[ 0 ];
            this._uploadNext = !!item;
            this._uploadNext && this.uploadItem(item);
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

        _progress: function (event, item, progress) {
            var result = this._getTotalProgress(progress);
            this.progress = result;
            this._observer.$emit('progressall', result);
            this.scope.$$phase || this.scope.$apply();
        },

        _complete: function () {
            this.isUploading = false;
            this._uploadNext && this.uploadAll();
            this._uploadNext || this._observer.$emit('completeall', this.queue);
            ( this._uploadNext && this.scope.$$phase ) || this.scope.$apply();
        },

        _changedQueue: function () {
            this.progress = this._getTotalProgress();
            this.scope.$$phase || this.scope.$apply();
        },

        _xhrTransport: function (item) {
            var xhr = new XMLHttpRequest();
            var form = new FormData();
            var that = this;

            form.append(item.alias, item.file);

            xhr.upload.addEventListener('progress', function (event) {
                var progress = event.lengthComputable ? event.loaded * 100 / event.total : 0;
                that._observer.$emit('in:progress', item, Math.round(progress));
            }, false);

            xhr.addEventListener('load', function () {
                xhr.status === 200 && that._observer.$emit('in:success', xhr, item);
                xhr.status !== 200 && that._observer.$emit('in:error', xhr, item);
                that._observer.$emit('in:complete', xhr, item);
            }, false);

            xhr.addEventListener('error', function () {
                that._observer.$emit('in:error', xhr, item);
                that._observer.$emit('in:complete', xhr, item);
            }, false);

            xhr.addEventListener('abort', function () {
                that._observer.$emit('in:complete', xhr, item);
            }, false);

            this._observer.$emit('beforeupload', item);

            xhr.open('POST', item.url, true);

            angular.forEach(item.headers, function (value, name) {
                xhr.setRequestHeader(name, value);
            });

            xhr.send(form);
        },

        _iframeTransport: function (item) {
            var form = item.file._form;
            var iframe = form.find('iframe');
            var input = form.find('input');
            var that = this;

            input.prop('name', item.alias);

            form.prop({
                action: item.url,
                method: 'post',
                target: iframe.prop('name'),
                enctype: 'multipart/form-data',
                encoding: 'multipart/form-data' // old IE
            });

            iframe.unbind('load').bind('load', function () {
                var xhr = { response: iframe.contents(), status: 200, dummy: true };
                that._observer.$emit('in:complete', xhr, item);
            });

            this._observer.$emit('beforeupload', item);

            form[ 0 ].submit();
        }
    };


    // item of queue
    function Item(params) {
        // fix for old browsers
        if (angular.isElement(params.file)) {
            var input = angular.element(params.file);
            var clone = $compile(input.clone())($rootScope.$new(true));
            var form = angular.element('<form style="display: none;" />');
            var iframe = angular.element('<iframe name="iframeTransport' + +new Date() + '">');
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
            isUploaded: false
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
            item.uploader._observer.$emit('progress', item, progress);
        },
        _success: function (event, xhr, item) {
            item.isUploaded = true;
            item.isUploading = false;
            item.uploader._observer.$emit('success', xhr, item);
        },
        _error: function (event, xhr, item) {
            item.isUploading = false;
            item.uploader._observer.$emit('error', xhr, item);
        },
        _complete: function (event, xhr, item) {
            item.isUploaded = xhr.status === 200;
            item.uploader._observer.$emit('complete', xhr, item);
            item.removeAfterUpload && item.remove();
        }
    };

    return {
        create: function (params) {
            return new Uploader(params);
        }
    };
}])
    return app;
}));