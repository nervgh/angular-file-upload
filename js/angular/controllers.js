'use strict';


angular
    .module( 'app', [ 'observer', 'files' ])

    // The example of the full functionality
    .controller( 'MainController', function( $scope, $fileUploader ) {
        $scope.model = {
            progress: 0,
            items: []
        };

        // user filter (example1)
        $scope.filter1 = function( item ) {
            console.log( 'filter1' );
            return true;
        };

        // user filter (example2)
        $scope.filter2 = function( item ) {
            console.log( 'filter2' );
            return true;
        };

        // callback
        $scope.afterAddingFile = function( item ) {
            console.log( item );
        };

        // callback
        $scope.afterAddingAll = function( items ) {
            $scope.model.items = $fileUploader.queue;
            $scope.$apply();
        };

        // callback
        $scope.beforeUpload = function( item ) {
            console.log( item );
        };

        // callback
        $scope.changedQueue = function( items ) {
            $scope.model.progress = $fileUploader.getTotalProgress();
            $scope.$$phase || $scope.$apply();
        };

        // callback: progress for item
        $scope.progress = function( event, item, progress ) {
            console.log( 'Progress: ' + progress );
        };

        // callback: success for item
        $scope.success = function( xhr, item ) {
            console.log( 'Success: ' + xhr.response );
        };

        // callback: complete for item
        $scope.complete = function( xhr ) {
            console.log( 'Complete: ' + xhr.response );
            $scope.$apply();
        };

        // callback: progress for queue
        $scope.progressAll = function( progress ) {
            $scope.model.progress = progress;
            $scope.$apply();
        };

        // callback: complete for queue
        $scope.completeAll = function() {
            console.log( 'All files are transferred' );
        };

        // queue control
        $scope.uploadAll = function() {
            $fileUploader.uploadAll();
        };

        // queue control
        $scope.removeAll = function() {
            $fileUploader.clearQueue();
        };

        // the number of not uploaded files
        $scope.notUploadedCount = function() {
            return $fileUploader.getNotUploadedItems().length;
        };

        $fileUploader.url = '/upload.php';

        // add filters
        $fileUploader.filters.push( $scope.filter1 );
        $fileUploader.filters.push( $scope.filter2 );

        // register handlers
        $fileUploader.bind( 'afteraddingfile', $scope.afterAddingFile );
        $fileUploader.bind( 'afteraddingall', $scope.afterAddingAll );
        $fileUploader.bind( 'beforeupload', $scope.beforeUpload );
        $fileUploader.bind( 'changedqueue', $scope.changedQueue );
        $fileUploader.bind( 'progress', $scope.progress );
        $fileUploader.bind( 'success', $scope.success );
        $fileUploader.bind( 'complete', $scope.complete );
        $fileUploader.bind( 'progressall', $scope.progressAll );
        $fileUploader.bind( 'completeall', $scope.completeAll );
    });