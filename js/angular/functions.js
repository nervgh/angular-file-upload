(function() {

    'use strict';


    angular.extend( angular, {
        isArrayLikeObject: isArrayLikeObject
    });


    /**
     * Checks if a value as array like object
     * @param value {*}
     * @returns {boolean}
     */
    function isArrayLikeObject( value ) {
        if ( angular.isObject( value ) ) {
            return 'length' in value;
        } else {
            return false;
        }
    }


}());