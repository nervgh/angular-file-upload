'use strict';


angular


    .module('app', ['angularFileUpload'])


    .controller('AppController', ['$scope', 'FileUploader', function($scope, FileUploader) {
        var uploader = $scope.uploader = new FileUploader({
            url: '../upload.php'
            //,timeout: 2000
        });

        $scope.testUploader = function(){
            angular.element("#testUpload").click();
        }        

        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);
    }]);
