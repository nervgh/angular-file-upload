# Angular File Upload

---

## Adding support for binary js upload

**Client Side**

Use as normal but passing your binaryJs client to the fileUploader object as in

```javascript
var binaryJsClient = new BinaryClient('ws://localhost:9001');

var uploader = $scope.uploader = new FileUploader({
  binaryJsClient : binaryJsClient
});
```

**Server Side**
You'll need a working instance of BinaryJs and then you may want to process the 
incoming stream as in

```javascript
client.on('stream', function(stream, meta) {
  console.log('Received stream: ', stream);
  console.log('With meta: ', meta);

  // store stream
  //
  var file = fs.createWriteStream('/tmp/' + meta.name);
  stream.pipe(file);
  //
  // Send progress back
  stream.on('data', function(data){
    var progress = {rx: data.length / meta.size};
    console.log('Data received: %d', progress.rx);
    stream.write(progress);
  });

});
```

For detailed informations on how to use [BinaryJs](https://github.com/binaryjs/binaryjs)

## About

**Angular File Upload** is a module for the [AngularJS](http://angularjs.org/) framework. Supports drag-n-drop upload, upload progress, validation filters and a file upload queue. It supports native HTML5 uploads, but degrades to a legacy iframe upload method for older browsers. Works with any server side platform which supports standard HTML form uploads.

When files are selected or dropped into the component, one or more filters are applied. Files which pass all filters are added to the queue and are ready to be uploaded.

You could find this module in bower like [_angular file upload_](http://bower.io/search/?q=angular%20file).

## Demos
1. [Simple example](http://nervgh.github.io/pages/angular-file-upload/examples/simple)
2. [Uploads only images (with canvas preview)](http://nervgh.github.io/pages/angular-file-upload/examples/image-preview)
3. [Without bootstrap example](http://nervgh.github.io/pages/angular-file-upload/examples/without-bootstrap)

## More Info

1. [Introduction](https://github.com/nervgh/angular-file-upload/wiki/Introduction)
2. [Module API](https://github.com/nervgh/angular-file-upload/wiki/Module-API)
3. [FAQ](https://github.com/nervgh/angular-file-upload/wiki/FAQ)
4. [Migrate from 0.x.x to 1.x.x](https://github.com/nervgh/angular-file-upload/wiki/Migrate-from-0.x.x-to-1.x.x)
5. [RubyGem](https://github.com/marthyn/angularjs-file-upload-rails)
