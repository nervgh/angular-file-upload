'use strict';


angular


    .module('app')


    // Angular File Upload module does not include this directive
    // Only for example


    /**
    * The ng-thumb directive
    * @author: nerv
    * @version: 0.1, 2014-01-07
    */
    .directive('ngThumb', ['$fileUploader', function($fileUploader) {
        return {
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!$fileUploader.isHTML5) return;

                var params = scope.$eval(attributes.ngThumb);
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
