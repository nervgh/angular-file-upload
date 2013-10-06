angular.module('app', ['angularFileUpload'])

    // The example of the full functionality
    .controller('TestController', function ($scope, $fileUploader) {
        'use strict';

        // create a uploader with options
        var uploader = $scope.uploader = $fileUploader.create({
            scope: $scope,                          // to automatically update the html. Default: $rootScope
            url: '/examples/upload.php',
            formData: [
                { key: 'value' }
            ],
            filters: [
                function (item) {                    // first user filter
                    console.log('filter1');
                    return true;
                }
            ]
        });

        // ADDING FILTER

        uploader.filters.push(function (item) { // second user filter
            console.log('filter2');
            return true;
        });

        // REGISTER HANDLERS

        uploader.bind('afteraddingfile', function (event, item) {
            console.log('After adding a file', item);
        });

        uploader.bind('afteraddingall', function (event, items) {
            console.log('After adding all files', items);
        });

        uploader.bind('changedqueue', function (event, items) {
            console.log('Changed queue', items);
        });

        uploader.bind('beforeupload', function (event, item) {
            console.log('Before upload', item);
        });

        uploader.bind('progress', function (event, item, progress) {
            console.log('Progress: ' + progress, item);
        });

        uploader.bind('success', function (event, xhr, item) {
            console.log('Success: ' + xhr.response, item);
        });

        uploader.bind('complete', function (event, xhr, item) {
            console.log('Complete: ' + xhr.response, item);
        });

        uploader.bind('progressall', function (event, progress) {
            console.log('Total progress: ' + progress);
        });

        uploader.bind('completeall', function (event, items) {
            console.log('All files are transferred', items);
        });

    });