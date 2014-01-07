'use strict';


angular


    .module('app')


    // Angular File Upload module does not include this directive
    // Only for example


    /**
    * The ng-thumb directive
    * @author: nerv
    * @version: 0.1.1, 2014-01-07
    */
    .directive('ngThumb', ['$fileUploader', '$window', function($fileUploader, $window) {
        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!$fileUploader.isHTML5 || !$window.FileReader || !$window.CanvasRenderingContext2D) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!angular.isObject(params.file) || !(params.file instanceof $window.File)) return;

                var type = params.file.type;
                type = '|' + type.slice(type.lastIndexOf('/') + 1) + '|';

                if ('|jpg|png|jpeg|bmp|'.indexOf(type) === -1) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }]);
