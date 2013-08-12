'use strict';


angular
    .module( 'files', [])


    .service( '$fileUploader', [ '$observer', '$compile', '$rootScope', function( $observer, $compile, $rootScope ) {
        var observer = $observer.create();

        var uploader = {

            url: '/',
            alias: 'file',
            queue: [],
            headers: {},
            autoUpload: false,
            removeAfterUpload: false,

            bind: function( event, handler ) {
                observer.on( event, handler );
            },

            unbind: function( event, handler ) {
                observer.off( event, handler );
            },

            hasHTML5: function() {
                return window.File && window.FormData;
            },

            /**
             * The base filter. If returns "true" an item will be added to the queue
             * @param {Object} item
             * @returns {boolean}
             */
            filters: [ function( item ) { return angular.isElement( item ) ? true : !!item.size; } ],

            /**
             * Add files to the queue
             * @param {FileList|File|Input} items
             */
            addToQueue: function( items ) {
                var length = this.queue.length;

                angular.forEach( angular.isArrayLikeObject( items ) ? items : [ items ], function( item ) {
                    var isValid = !this.filters.length ? true : !!this.filters.filter(function( filter ) {
                        return filter.apply( this, [ item ]);
                    }, this ).length;

                    if ( isValid ) {
                        item = new Item({ file: item });
                        this.queue.push( item );
                        observer.fire( 'afteraddingfile', [ item ], this );
                    }
                }, this );

                if ( this.queue.length !== length ) {
                    observer.fire( 'afteraddingall', [ this.queue ], this );
                    observer.fire( 'changedqueue', [ this.queue ], this );
                }
                this.autoUpload && this.uploadAll();
            },

            /**
             * Remove items from the queue. Remove last: index = -1
             * @param {Object|Number} value
             */
            removeFromQueue: function( value ) {
                var index = angular.isObject( value ) ? this.getIndexOfItem( value ) : value;
                var item = this.queue.splice( index, 1 )[ 0 ];
                item.file._form && item.file._form.remove();
                observer.fire( 'changedqueue', [ item ], this );
            },

            clearQueue: function() {
                angular.forEach( this.queue, function( item ) {
                    item.file._form && item.file._form.remove();
                }, this );
                this.queue.length = 0;
                observer.fire( 'changedqueue', [ this.queue ], this );
            },

            /**
             * Returns a index of item from the queue
             * @param item
             * @returns {Number}
             */
            getIndexOfItem: function( item ) {
                return this.queue.indexOf( item );
            },

            /**
             * Returns not uploaded items
             * @returns {Array}
             */
            getNotUploadedItems: function() {
                return this.queue.filter(function( item ) { return !item.isUploaded; });
            },

            /**
             * Returns the total progress
             * @param {Number} [value]
             * @returns {Number}
             */
            getTotalProgress: function( value ) {
                if ( this.removeAfterUpload ) {
                    return value || 0;
                }

                var notUploaded = this.getNotUploadedItems().length;
                var uploaded = notUploaded ? this.queue.length - notUploaded : this.queue.length;
                var ratio = 100 / this.queue.length;
                var current = ( value || 0 ) * ratio / 100;

                return Math.round( uploaded * ratio + current );
            },

            /**
             * Upload a item from the queue
             * @param {Item|Number} value
             */
            uploadItem: function( value ) {
                if ( this._isUploading ) {
                    return;
                }

                var index = angular.isObject( value ) ? this.getIndexOfItem( value ) : value;
                var item = this.queue[ index ];
                var transport = item.file._form ? '_iframeTransport' : '_xhrTransport';
                this._isUploading = true;
                this[ transport ]( item );
            },

            uploadAll: function() {
                var item = this.getNotUploadedItems()[ 0 ];
                this._uploadNext = !!item;
                this._uploadNext && this.uploadItem( item );
            },

            _uploadNext: false,
            _isUploading: false,

            _progress: function( event, item, progress ) {
                var result = this.getTotalProgress( progress );
                observer.fire( 'progressall', [ result ], this );
            },

            _complete: function() {
                this._isUploading = false;
                this._uploadNext && this.uploadAll();
                this._uploadNext || observer.fire( 'completeall', [ this.queue ], this );
            },

            _xhrTransport: function( item ) {
                var xhr = new XMLHttpRequest();
                var form = new FormData();
                var that = this;

                form.append( item.alias, item.file );

                angular.forEach( item.headers, function( value, name ) {
                    xhr.setRequestHeader( name, value );
                });

                xhr.upload.addEventListener( 'progress', function( event ) {
                    var progress = event.lengthComputable ? event.loaded * 100 / event.total : 0;
                    observer.fire( 'in:progress', [ event, item, Math.round( progress ) ], that );
                }, false );

                xhr.addEventListener( 'load', function() {
                    xhr.status === 200 && observer.fire( 'in:success', [ xhr, item ], that );
                    xhr.status !== 200 && observer.fire( 'in:error', [ xhr, item ], that );
                    observer.fire( 'in:complete', [ xhr, item ], that );
                }, false );

                xhr.addEventListener( 'error', function() {
                    observer.fire( 'in:error', [ xhr, item ], that );
                    observer.fire( 'in:complete', [ xhr, item ], that );
                }, false );

                xhr.addEventListener( 'abort', function() {
                    observer.fire( 'in:complete', [ xhr, item ], that );
                }, false );

                observer.fire( 'beforeupload', [ item ], this );

                xhr.open( 'POST', item.url, true );
                xhr.send( form );
            },

            _iframeTransport: function( item ) {
                var form = item.file._form;
                var iframe = form.find( 'iframe' );
                var input = form.find( 'input' );
                var that = this;

                input.prop( 'name', item.alias );

                form.prop({
                    action: item.url,
                    method: 'post',
                    target: iframe.prop( 'name' ),
                    enctype: 'multipart/form-data',
                    encoding: 'multipart/form-data' // old IE
                });

                iframe.bind( 'load', function() {
                    var xhr = { response: iframe.contents(), status: 200, dummy: true };
                    observer.fire( 'in:complete', [ xhr, item ], that );
                });

                observer.fire( 'beforeupload', [ item ], this );

                form[ 0 ].submit();
            }
        };


        // item of queue
        function Item( params ) {

            // fix for old browsers
            if ( angular.isElement( params.file ) ) {
                var input = angular.element( params.file );
                var clone = $compile( input.clone() )( $rootScope.$new( true ) );
                var form = angular.element( '<form style="display: none;" />' );
                var iframe = angular.element( '<iframe name="iframeTransport' + +new Date() + '" />' );
                var value = input.val();

                params.file = {
                    lastModifiedDate: null,
                    size: null,
                    type: 'like/' + value.replace( /^.+\.(?!\.)|.*/, '' ),
                    name: value.match( /[^\\]+$/ )[ 0 ],
                    _form: form
                };

                input.after( clone ).after( form );
                form.append( input ).append( iframe );
            }

            angular.extend( this, {
                url: uploader.url,
                alias: uploader.alias,
                headers: angular.extend({}, uploader.headers ),
                removeAfterUpload: uploader.removeAfterUpload,
                progress: null,
                isUploading: false,
                isUploaded: false
            }, params );
        }

        Item.prototype = {
            remove: function() {
                uploader.removeFromQueue( this );
            },
            upload: function() {
                uploader.uploadItem( this );
            },
            _beforeupload: function( item ) {
                item.isUploaded = false;
                item.isUploading = true;
                item.progress = null;
            },
            _progress: function( event, item, progress ) {
                item.progress = progress;
                observer.fire( 'progress', [ event, item, progress ], uploader );
            },
            _success: function( xhr, item ) {
                item.isUploaded = true;
                item.isUploading = false;
                observer.fire( 'success', [ xhr, item ], uploader );
            },
            _error: function( xhr, item ) {
                item.isUploading = false;
                observer.fire( 'error', [ xhr, item ], uploader );
            },
            _complete: function( xhr, item ) {
                item.isUploaded = xhr.status === 200;
                observer.fire( 'complete', [ xhr, item ], uploader );
                item.removeAfterUpload && item.remove();
            }
        };

        observer.on( 'beforeupload', Item.prototype._beforeupload );
        observer.on( 'in:progress', Item.prototype._progress );
        observer.on( 'in:success', Item.prototype._success );
        observer.on( 'in:error', Item.prototype._error );
        observer.on( 'in:complete', Item.prototype._complete );

        observer.on( 'in:progress', uploader._progress );
        observer.on( 'in:complete', uploader._complete );

        return uploader;
    }])


    // It is attached to an element which will be assigned to a class "ng-file-over" or ng-file-over="className"
    .directive( 'ngFileOver', function() {
        return {
            link: function( $scope, $element, $attrs ) {
                $scope.$on( 'addfileoverclass', function() {
                    $element.addClass( $attrs.ngFileOver || 'ng-file-over' );
                })
                $scope.$on( 'removefileoverclass', function() {
                    $element.removeClass( $attrs.ngFileOver || 'ng-file-over' );
                });
            }
        };
    })


    // It is attached to an element that catches the event drop file
    .directive( 'ngFileDrop', [ '$fileUploader', function( $fileUploader ) {
        return {
            // don't use drag-n-drop files in IE9, because not File API support
            link: !window.File ? angular.noop : function( $scope, $element ) {
                $element
                    .bind( 'drop', function( event ) {
                        var dataTransfer = event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
                        event.preventDefault();
                        $scope.$broadcast( 'removefileoverclass' );
                        $fileUploader.addToQueue( dataTransfer.files );
                    })
                    .bind( 'dragover', function( event ) {
                        var dataTransfer = event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
                        event.preventDefault();
                        dataTransfer.dropEffect = 'copy';
                        $scope.$broadcast( 'addfileoverclass' );
                    })
                    .bind( 'dragleave', function() {
                        $scope.$broadcast( 'removefileoverclass' );
                    });
            }
        };
    }])


    // It is attached to <input type="file" /> element
    .directive( 'ngFileSelect', [ '$fileUploader', function( $fileUploader ) {
        return {
            link: function( $scope, $element ) {
                if ( !$fileUploader.hasHTML5() ) {
                    $element.removeAttr( 'multiple' );
                }

                $element.bind( 'change', function() {
                    $fileUploader.addToQueue( this.files ? this.files : this );
                });
            }
        }
    }]);