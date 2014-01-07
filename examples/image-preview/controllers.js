'use strict';


angular


    .module('app', ['angularFileUpload'])


    .controller('TestController', function ($scope, $fileUploader) {
        // Creates a uploader
        var uploader = $scope.uploader = $fileUploader.create({scope: $scope});

        // Sets url
        uploader.url = 'upload.php';

        // Registers a filter: images only
        uploader.filters.push(function(file) {
            if (!uploader.isHTML5) return true; // old browsers
            var type = file.type.slice(file.type.lastIndexOf('/') + 1);
            return '|jpg|png|jpeg|bmp|'.indexOf('|' + type + '|') !== -1;
        });
    });
