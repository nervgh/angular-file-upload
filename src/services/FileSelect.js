'use strict';


import CONFIG from './../config.json';


let {
    extend
    } = angular;


export default (FileDirective) => {
    
    
    class FileSelect extends FileDirective {
        /**
         * Creates instance of {FileSelect} object
         * @param {Object} options
         * @constructor
         */
        constructor(options) {
            let extendedOptions = extend(options, {
                // Map of events
                events: {
                    $destroy: 'destroy',
                    change: 'onChange'
                },
                // Name of property inside uploader._directive object
                prop: 'select'
            });
            
            super(extendedOptions);

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
            var files = this.element[0].files;
            var options = this.getOptions();
            var filters = this.getFilters();

            this.uploader.addToQueue(files, options, filters);
            if(this.isEmptyAfterSelection()) this.element.prop('value', null);
        }
    }
    
    
    return FileSelect;
}


module.exports.$inject = [
    'FileDirective'
];