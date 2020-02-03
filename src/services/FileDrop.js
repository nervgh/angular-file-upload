'use strict';


import CONFIG from './../config.json';


let {
    extend,
    forEach
    } = angular;


export default function __identity(FileDirective) {


    return class FileDrop extends FileDirective {
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
                    dragleave: 'onDragLeave',
                    dragenter: 'onDragEnter'
                },
                // Name of property inside uploader._directive object
                prop: 'drop'
            });

            super(extendedOptions);

            this.dragCount = 0;
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
            this.dragCount = 0;
            var options = this.getOptions();
            var filters = this.getFilters();
            this._preventAndStop(event);
            forEach(this.uploader._directives.over, this._removeOverClass, this);
            this.uploader.addToQueue(transfer.files, options, filters);
        }
        onDragEnter() {
            this.dragCount++;
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
            this.dragCount--;
            if (event.currentTarget !== this.element[0]) return;
            var that = this;
            clearTimeout(that.onDragLeaveTimer);
            that.onDragLeaveTimer = setTimeout(function(){
                if (that.dragCount > 0) return;
                that._preventAndStop(event);
                forEach(that.uploader._directives.over, that._removeOverClass, that);
            }, 0);
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
}


__identity.$inject = [
    'FileDirective'
];
