'use strict';


import CONFIG from './../config.json';


let {
    extend
    } = angular;


export default function __() {


    class FileDirective {
        /**
         * Creates instance of {FileDirective} object
         * @param {Object} options
         * @param {Object} options.uploader
         * @param {HTMLElement} options.element
         * @param {Object} options.events
         * @param {String} options.prop
         * @constructor
         */
        constructor(options) {
            extend(this, options);
            this.uploader._directives[this.prop].push(this);
            this._saveLinks();
            this.bind();
        }
        /**
         * Binds events handles
         */
        bind() {
            for(var key in this.events) {
                var prop = this.events[key];
                this.element.bind(key, this[prop]);
            }
        }
        /**
         * Unbinds events handles
         */
        unbind() {
            for(var key in this.events) {
                this.element.unbind(key, this.events[key]);
            }
        }
        /**
         * Destroys directive
         */
        destroy() {
            var index = this.uploader._directives[this.prop].indexOf(this);
            this.uploader._directives[this.prop].splice(index, 1);
            this.unbind();
            // this.element = null;
        }
        /**
         * Saves links to functions
         * @private
         */
        _saveLinks() {
            for(var key in this.events) {
                var prop = this.events[key];
                this[prop] = this[prop].bind(this);
            }
        }
    }


    /**
     * Map of events
     * @type {Object}
     */
    FileDirective.prototype.events = {};


    return FileDirective;
}


__.$inject = [
];