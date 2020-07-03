'use strict';
angular
    .module('app', ['angularFileUpload'])
    .controller('AppController', ['$scope', 'FileUploader', function ($scope, FileUploader) {
        var uploader = $scope.uploader = new FileUploader({
            url: '../upload.php'
        });

        $scope.upload = function () {
            var items = uploader.getNotUploadedItems();
            if (items.length == 0) {
                console.log("No files to upload");
                return false;
            }

            for (var i = 0; i < items.length; i++) {
                var fileItem = changeFileName(items[i], "");
                fileItem.upload();
            }
        };

        function changeFileName(fileItem, newFileName) {
            newFileName = newFileName || "file" + new Date().getTime();

            var fileName = fileItem.file.name.split('.');
            if (fileName.length < 2) {
                alert("Uploaded file must have a valid extension! For more information see the Supported Formats")
            }
            var fileExtension = "." + fileName.pop();
            fileItem.file.name = newFileName + fileExtension;
            return fileItem;
        }
    }]);
