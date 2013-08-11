'use strict';


angular
    .module( 'observer', [])


    .service( '$observer', function() {
        function Observer() {
            this._events = {};
        }

        Observer.prototype = {

            on: function( events, handler ) {
                angular.forEach( events.split( ' ' ), function( event ) {
                    this._events[ event ] = this._events[ event ] || [];
                    this._events[ event ].push( handler );
                }, this );
            },

            off: function( events, handler ) {
                angular.forEach( events.split( ' ' ), function( event ) {
                    if ( !this._events[ event ] ) {
                        return;
                    }

                    if ( !angular.isUndefined( handler ) ) {
                        this._events[ event ].length = 0;
                        return;
                    }

                    var arr = this._events[ event ];
                    var index = arr.length;

                    while( index-- ) {
                        if( handler === arr[ index ] ) {
                            arr.splice( index, 1 );
                        }
                    }
                }, this );
            },

            fire: function( event, params, context ) {
                if ( this._events[ event ] ) {
                    angular.forEach( this._events[ event ], function( item ) {
                        item.apply( context || this, params );
                    }, this );
                }
            }
        };

        return {
            create: function() {
                return new Observer();
            }
        };
    });
