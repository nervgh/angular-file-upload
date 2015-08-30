'use strict';


import CONFIG from './../config.json';


let {
    extend,
    forEach
    } = angular;


export default (FileDirective) => {
    
    
    class FileDrop extends FileDirective {
        /**
         * Creates instance of {FileDrop} object
         * @param {Object} options
         * @constructor
         */
        constructor(options) {
            let extendedOptions = extend(options, {
                // Map of events
                events: {
                    $destroy: 'destroy',
                    drop: 'onDrop',
                    dragover: 'onDragOver',
                    dragleave: 'onDragLeave'
                },
                // Name of property inside uploader._directive object
                prop: 'drop'
            });
            
            super(extendedOptions);
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
         * Event handler
         */
        onDrop(event) {
            var transfer = this._getTransfer(event);
            if(!transfer) return;
            var options = this.getOptions();
            var filters = this.getFilters();
            this._preventAndStop(event);
            forEach(this.uploader._directives.over, this._removeOverClass, this);
            this.uploader.addToQueue(transfer.files, options, filters);
        }
        /**
         * Event handler
         */
        onDragOver(event) {
            var transfer = this._getTransfer(event);
            if(!this._haveFiles(transfer.types)) return;
            transfer.dropEffect = 'copy';
            this._preventAndStop(event);
            forEach(this.uploader._directives.over, this._addOverClass, this);
        }
        /**
         * Event handler
         */
        onDragLeave(event) {
            if(event.currentTarget === this.element[0]) return;
            this._preventAndStop(event);
            forEach(this.uploader._directives.over, this._removeOverClass, this);
        }
        /**
         * Helper
         */
        _getTransfer(event) {
            return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
        }
        /**
         * Helper
         */
        _preventAndStop(event) {
            event.preventDefault();
            event.stopPropagation();
        }
        /**
         * Returns "true" if types contains files
         * @param {Object} types
         */
        _haveFiles(types) {
            if(!types) return false;
            if(types.indexOf) {
                return types.indexOf('Files') !== -1;
            } else if(types.contains) {
                return types.contains('Files');
            } else {
                return false;
            }
        }
        /**
         * Callback
         */
        _addOverClass(item) {
            item.addOverClass();
        }
        /**
         * Callback
         */
        _removeOverClass(item) {
            item.removeOverClass();
        }
    }
    
    
    return FileDrop;
}


module.exports.$inject = [
    'FileDirective'
];