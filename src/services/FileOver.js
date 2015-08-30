'use strict';


import CONFIG from './../config.json';


let {
    extend
    } = angular;


export default (FileDirective) => {
    
    
    class FileOver extends FileDirective {
        /**
         * Creates instance of {FileDrop} object
         * @param {Object} options
         * @constructor
         */
        constructor(options) {
            let extendedOptions = extend(options, {
                // Map of events
                events: {
                    $destroy: 'destroy'
                },
                // Name of property inside uploader._directive object
                prop: 'over',
                // Over class
                overClass: 'nv-file-over'
            });
            
            super(extendedOptions);
        }
        /**
         * Adds over class
         */
        addOverClass() {
            this.element.addClass(this.getOverClass());
        }
        /**
         * Removes over class
         */
        removeOverClass() {
            this.element.removeClass(this.getOverClass());
        }
        /**
         * Returns over class
         * @returns {String}
         */
        getOverClass() {
            return this.overClass;
        }
    }
    
    
    return FileOver;
}


module.exports.$inject = [
    'FileDirective'
];