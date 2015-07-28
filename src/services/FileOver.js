'use strict';


import CONFIG from './../config.json';


export default function __(FileDirective) {
    
    
    class FileOver extends FileDirective {
        /**
         * Creates instance of {FileDrop} object
         * @param {Object} options
         * @constructor
         */
        constructor(options) {
            // Map of events
            this.events = {
                $destroy: 'destroy'
            };
            // Name of property inside uploader._directive object
            this.prop = 'over';
            // Over class
            this.overClass = 'nv-file-over';
            
            super(options);
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


__.$inject = [
    'FileDirective'
];