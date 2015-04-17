 # Angular File Upload

## v1.2.0
* added grunt watch task. Please use ```grunt watch``` to automatically build angular-file-upload.* files for easier development
* imported ngThumb directive in angularFileUpload moudule
* if ngThumb is used under under a uploader directive then the thumbnails will be blured according to upload status

## Added support for socket.io-stream
Use as normal passing your socketJsClaient client to fileuploader object

**Client Side**
You may want to have angular js service as in:
```javascript
.service('fileService', function (FileUploader, socket) {
    var uploader = new FileUploader({
      socketJsClient : socket
    });

    uploader.filters.push({
      name: 'customFilter',
      fn: function(item /*{File|FileLikeObject}*/, options) {
        return this.queue.length < 10;
      }
    });

    return uploader;
  });
```
where the socket service is something like
```javascript
.factory('socket', function(socketFactory) {

    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io('', {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
      path: '/socket.io-client'
    });

    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,

      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      syncUpdates: function (modelName, array, cb) {
        cb = cb || angular.noop;

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.push(item);
          }

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';
          _.remove(array, {_id: item._id});
          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      },

      /**
       * Send a Stream to the server
       *
       * @param {file} the file to upload
       * @param {Object} metadata
       */
      send : function(file, metadata) {
        metadata = angular.extend(metadata || {}, {
          name : file.name,
          size : file.size
        });

        console.log('Streaming : ', metadata, socket);

        var stream = ss.createStream();

        // upload a file to the server.
        ss(socket).emit('stream', stream, metadata);
        ss.createBlobReadStream(file).pipe(stream);

        return stream;
      }
    };
  });

```

**Server Side**
You'll need a working instance of Socket.io with socket.io-stream processing
incoming stream as in:
```javascript
// Got stream from client
  ss(socket).on('stream', function(stream, metadata) {
    console.info('Got Stream with metadata: ', metadata);
    var itemHash = metadata.hash;
    var size = 0;
    var progress = 0;
    stream.on('data', function(chunk) {
      size += chunk.length;
      progress = Math.floor(size / metadata.size * 100);
      socket.emit('progress', { itemKey : itemHash, tx : progress });

    });

    stream.on('end', function() {
      console.log('File uploaded successfully');
      socket.emit('upload-done', { itemKey : itemHash });
    })
  });
```

## Added support for binary js upload

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
