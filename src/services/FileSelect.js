'use strict';


import CONFIG from './../config.json';


export default function __(FileDirective) {
    
    
    class FileSelect extends FileDirective {
        /**
         * Creates instance of {FileSelect} object
         * @param {Object} options
         * @constructor
         */
        constructor(options) {
            // Map of events
            this.events = {
                $destroy: 'destroy',
                change: 'onChange'
            };
            // Name of property inside uploader._directive object
            this.prop = 'select';
            
            super(options);
            
            if(!this.uploader.isHTML5) {
                this.element.removeAttr('multiple');
            }
            this.element.prop('value', null); // FF fix
        }
        /**
         * Returns options
         * @return {Object|undefined}
         */
        getOptions() {
        }
        /**
         * Returns filters
         * @return {Array<Function>|String|undefined}
         */
        getFilters() {
        }
        /**
         * If returns "true" then HTMLInputElement will be cleared
         * @returns {Boolean}
         */
        isEmptyAfterSelection() {
            return !!this.element.attr('multiple');
        }
        /**
         * Event handler
         */
        onChange() {
            var files = this.uploader.isHTML5 ? this.element[0].files : this.element[0];
            var options = this.getOptions();
            var filters = this.getFilters();

            if(!this.uploader.isHTML5) this.destroy();
            this.uploader.addToQueue(files, options, filters);
            if(this.isEmptyAfterSelection()) this.element.prop('value', null);
        }
    }
    
    
    return FileSelect;
}


__.$inject = [
    'FileDirective'
];