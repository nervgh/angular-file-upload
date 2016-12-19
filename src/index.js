'use strict';


import CONFIG from './config.json';


import options from './values/options'


import serviceFileUploader from './services/FileUploader';
import serviceFileLikeObject from './services/FileLikeObject';
import serviceFileItem from './services/FileItem';
import serviceFileDirective from './services/FileDirective';
import serviceFileSelect from './services/FileSelect';
import servicePipeline from './services/Pipeline';
import serviceFileDrop from './services/FileDrop';
import serviceFileOver from './services/FileOver';


import directiveFileSelect from './directives/FileSelect';
import directiveFileDrop from './directives/FileDrop';
import directiveFileOver from './directives/FileOver';


angular
    .module(CONFIG.name, [])
    .value('fileUploaderOptions', options)
    .factory('FileUploader', serviceFileUploader)
    .factory('FileLikeObject', serviceFileLikeObject)
    .factory('FileItem', serviceFileItem)
    .factory('FileDirective', serviceFileDirective)
    .factory('FileSelect', serviceFileSelect)
    .factory('FileDrop', serviceFileDrop)
    .factory('FileOver', serviceFileOver)
    .factory('Pipeline', servicePipeline)
    .directive('nvFileSelect', directiveFileSelect)
    .directive('nvFileDrop', directiveFileDrop)
    .directive('nvFileOver', directiveFileOver)
    .run([
        'FileUploader',
        'FileLikeObject',
        'FileItem',
        'FileDirective',
        'FileSelect',
        'FileDrop',
        'FileOver',
        'Pipeline',
        function(FileUploader, FileLikeObject, FileItem, FileDirective, FileSelect, FileDrop, FileOver, Pipeline) {
            // only for compatibility
            FileUploader.FileLikeObject = FileLikeObject;
            FileUploader.FileItem = FileItem;
            FileUploader.FileDirective = FileDirective;
            FileUploader.FileSelect = FileSelect;
            FileUploader.FileDrop = FileDrop;
            FileUploader.FileOver = FileOver;
            FileUploader.Pipeline = Pipeline;
        }
    ]);
