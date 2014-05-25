#Angular File Upload

---

## English documentation

## About

**Angular File Upload** is a module for the [AngularJS](http://angularjs.org/) framework. Supports drag-n-drop upload, upload progress, validation filters and a file upload queue. It supports native HTML5 uploads, but degrades to a legacy iframe upload method for older browsers. Works with any server side platform which supports standard HTML form uploads.

When files are selected or dropped into the component, one or more filters are applied. Files which pass all filters are added to the queue and are ready to be uploaded.

## Demos
1. [Simple example](http://nervgh.github.io/pages/angular-file-upload/examples/simple)
2. [Uploads only images (with canvas preview)](http://nervgh.github.io/pages/angular-file-upload/examples/image-preview)
3. [Without bootstrap example](http://nervgh.github.io/pages/angular-file-upload/examples/without-bootstrap)

## Requires

- The [AngularJS](https://github.com/angular/angular.js) framework
- ES5 (Array.indexOf, Array.forEach, Array.filter, Array.every, Function.bind, Date.now) A shim is provided for older browsers

## Includes

### Directives

- **ngFileSelect**: Should be applied to `<input type="file" />`. The selected files are added to the uploaded queue if they have passed the filters.
- **ngFileDrop**: Set up a drop area. Usually applied to the entire document. Caught files are added to the uploaded queue if they have passed the filters.
- **ngFileOver**: Should be applied to the element which will change class when files are about to be placed on the drop area. By default it adds the class `ng-file-over` but a different class can be specified with the parameter attribute `ng-file-over="className"`.

### Service

- **$fileUploader**: Manages the upload queue and the uploading of files


### Service API:

#### Properties
- **isHTML5** `{Boolean}`: `true` if uploader is html5-uploader. Read only.

#### Methods
- **create**`function(params) {return {Uploader};}`: Creates an instance of uploader. [Params](https://github.com/nervgh/angular-file-upload#properties)


### The Uploader API:

#### Properties

- **scope** `{Object}`: Scope for HTML update, default is `$rootScope`
- **url** `{String}`: Path on the server to upload files
- **alias** `{String}`: Name of the field which will contain the file, default is `file`
- **queue** `{Array}`: Items to be uploaded
- **progress** `{Number}`: Upload queue progress percentage. Read only.
- **headers** `{Object}`: Headers to be sent along with the files. HTML5 browsers only.
- **formData** `{Array}`: Data to be sent along with the files
- **filters** `{Array}`: Filters to be applied to the files before adding them to the queue. If the filter returns `true` the file will be added to the queue
- **autoUpload** `{Boolean}`: Automatically upload files after adding them to the queue
- **method** `{String}`: It's a request method. By default `POST`. HTML5 browsers only.
- **removeAfterUpload** `{Boolean}`: Remove files from the queue after uploading
- **isHTML5** `{Boolean}`: `true` if uploader is html5-uploader. Read only.
- **isUploading** `{Boolean}`: `true` if an upload is in progress. Read only.
- **queueLimit** `{Number}` : maximum count of files
- **withCredentials** `{Boolean}` : enable CORS. HTML5 browsers only.

#### Methods

- **bind** `function(event, handler) {`: Registers an event handler
- **trigger** `function(event[, params ]) {`: Executes all handlers bound to this event
- **addToQueue** `function(items, options) {`: Add items to the queue, where `items` is a `FileList`, `File` or `Input`, and `options` is an `Object`
- **removeFromQueue** `function({Item|Index}) {`: Remove an item from the queue, where `value` is a queue element `Item` or index
- **clearQueue** `function() {`: Removes all elements from the queue
- **getIndexOfItem** `function({Item}) {return {Number};}`: Returns the index of the `Item` queue element
- **getReadyItems** `function() {return {Array};}`: Return items are ready to upload
- **getNotUploadedItems** `function() {return {Array};}`: Return an array of all pending items on the queue
- **uploadItem** `function({Item|Index}) {`: Uploads an item, where `value` is a queue element `Item` or index
- **uploadAll** `function() {`: Upload all pending items on the queue
- **cancelItem** `function({Item|Index}) {`: Cancels uploading of item, where `value` is a queue element `Item` or index
- **cancelAll** `function() {`: Cancels all current uploads

### The Item API:

#### Properties

- **url** `{String}`: Path on the server in which this file will be uploaded
- **alias** `{String}`: Name of the field which will contain the file, default is `file` 
- **headers** `{Object}`: Headers to be sent along with this file. HTML5 browsers only.
- **formData** `{Array}`: Data to be sent along with this file
- **method** `{String}`: It's a request method. By default `POST`. HTML5 browsers only.
- **withCredentials** `{Boolean}` : enable CORS. HTML5 browsers only.
- **removeAfterUpload** `{Boolean}`: Remove this file from the queue after uploading
- **index** `{Number}` - A sequence number upload. Read only.
- **progress** `{Number}`: File upload progress percentage. Read only.
- **isReady** `{Boolean}` - File is ready to upload. Read only.
- **isUploading** `{Boolean}`: `true` if the file is being uploaded. Read only.
- **isUploaded** `{Boolean}`: `true` if the file was uploaded. Read only.
- **isSuccess** `{Boolean}`: `true` if the file was uploaded successfully. Read only.
- **isCancel** `{Boolean}` : `true` if uploading was canceled. Read only.
- **isError** `{Boolean}` - `true` if occurred error while file uploading. Read only.
- **uploader** `{Object}`: Reference to the parent `Uploader` object for this file. Read only.

#### Methods

- **remove** `function() {`: Remove this file from the queue
- **upload** `function() {`: Upload this file
- **cancel** `function() {`: Cancels uploading of this file

## Filters

### Register a filter

```javascript
var uploader = $fileUploader.create({
    scope: $scope,
    filters: [
        function(item) {                    // A user-defined filter
            return true;
        }
    ]
});

// Another user-defined filter
uploader.filters.push(function(item) {
    return true;
});
```

### Predefined filters

1. [emptyFileFilter](https://github.com/nervgh/angular-file-upload/blob/v0.4.1/src/scripts/services/%24fileUploader.js#L58)
2. [queueLimitFilter](https://github.com/nervgh/angular-file-upload/blob/v0.4.1/src/scripts/services/%24fileUploader.js#L68)

## Events

### Supported events

- **afteraddingfile** `function(event, item) {`: Fires after adding a single file to the queue
- **whenaddingfilefailed** `function(event, item) {`: When adding a file failed
- **afteraddingall** `function(event, items) {`: Fires after adding all the dragged or selected files to the queue
- **beforeupload** `function(event, item) {`: Fires before uploading an item
- **progress** `function(event, item, progress) {`: On file upload progress
- **success** `function(event, xhr, item, response) {`: On file successfully uploaded
- **cancel** `function(event, xhr, item) {` - On cancel uploading
- **error** `function(event, xhr, item[, response ]) {`: On upload error
- **complete** `function(event, xhr, item, response) {`: On file upload complete (independently of the sucess of the operation)
- **progressall** `function(event, progress) {`: On upload queue progress
- **completeall** `function(event, items) {`: On all loaded when uploading an entire queue, or on file loaded when uploading a single independent file

### Registering event handlers

```javascript
var uploader = $fileUploader.create({scope: $scope});

uploader.bind('progress', function(event, item, progress) {
    console.log('Progress: ' + progress);
});
```

### FAQ
1. How to add the previously uploaded files in the queue?

    ```javascript
    // Add a item to the queue
    var item = {
        file: {
            name: 'Your file name',
            size: 1e6
        },
        progress: 100,
        isUploaded: true,
        isSuccess: true
    };
    item.remove = function() {
        uploader.removeFromQueue(this);
    };
    uploader.queue.push(item);
    uploader.progress = 100;
    ```

2. How do I deal with Cross Site Request Forgery protection?

    See this issue: [#40](https://github.com/nervgh/angular-file-upload/issues/40)

    For example, in Ruby on Rails, add an additional header, and use [this method](http://stackoverflow.com/questions/14734243/rails-csrf-protection-angular-js-protect-from-forgery-makes-me-to-log-out-on#answers) for verifying XSRF:

    ```javascript
    var csrf_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    var uploader = $scope.uploader = $fileUploader.create({
          // your code here...
          headers : {
            'X-CSRF-TOKEN' : csrf_token // X-CSRF-TOKEN is used for Ruby on Rails Tokens
          },
          //...
      });
    ```

3. How to update options dynamically?

    See this [comment](https://github.com/nervgh/angular-file-upload/issues/97#issuecomment-39248062)

4. I need custom options. Are there they?

    See this [comment](https://github.com/nervgh/angular-file-upload/pull/104#issuecomment-39887419)

---

## Русская документация

## О модуле

**Angular File Upload** - модуль загрузки файлов (html5 + iframe) для фреймворка [AngularJS](http://angularjs.org/). Поддерживает drag-n-drop загрузку, индикацию прогресса загрузки, очередь. В старых браузерах деградирует до iframe загрузчика.<br />
В общих чертах работа модуля выглядит так: директивы "ловят" файлы и добавляют их в очередь, если те прошли фильтры, после чего "загрузчик файлов" может ими (элементами очереди) манипулировать.

## Примеры
1. [Simple example](http://nervgh.github.io/pages/angular-file-upload/examples/simple)
2. [Uploads only images (with canvas preview)](http://nervgh.github.io/pages/angular-file-upload/examples/image-preview)
3. [Without bootstrap example](http://nervgh.github.io/pages/angular-file-upload/examples/without-bootstrap)

## Требует
- [AngularJS](https://github.com/angular/angular.js) фреймворк
- ES5 (Array.indexOf, Array.forEach, Array.filter, Array.every, Function.bind, Date.now)

## Включает

### Директивы

- **ngFileSelect** - применяется к`<input type="file" />`. Выбранные файлы добавляются в очередь загрузки, если они прошли фильтры.
- **ngFileDrop** - задает область сброса файлов / элемент, который будет ловить файлы. Как правило, применяется ко всему документу. Пойманные файлы добавляются в очередь загрузки, если они прошли фильтры.
- **ngFileOver** - применяется к элементу, который будет реагировать (менять класс), когда файлы находятся над областью сброса. По умолчанию добавляется класс `ng-file-over`. Другой класс можно задать в параметре атрибута `ng-file-over="className"`.

### Сервис

- **$fileUploader** - управляет очередью и загрузкой файлов


### Service API:

#### Properties
- **isHTML5** `{Boolean}` - `true`, если это html5-загрузчик. Только для чтения.

#### Methods
- **create**`function(params) {return {Uploader};}`: Создает экземпляр загрузчика. [Params](https://github.com/nervgh/angular-file-upload#%D0%A1%D0%B2%D0%BE%D0%B9%D1%81%D1%82%D0%B2%D0%B0)


### Загрузчик API:

#### Свойства

- **scope** `{Object}` - ссылка на scope для обновления html. Если параметр опущен, используется `$rootScope`
- **url** `{String}` - путь на сервере, по которому будут загружаться файлы
- **alias** `{String}` - псевдоним файла
- **queue** `{Array}`- очередь загрузки
- **progress** `{Number}`- прогресс загрузки очереди. Только для чтения.
- **headers** `{Object}` - заголовки, которые будут переданы вместе с файлами. Только для HTML5 браузеров.
- **formData** `{Array}` - данные, отправляемые вместе с файлами
- **filters** `{Array}` - фильтры, применяемые к [файлу|элементу] перед добавлением его в очередь. Если фильтр возвращает `true`, [файл|элемент] будет добавлен в очередь
- **autoUpload** `{Boolean}` - загружать автоматически после добавления элемента в очередь
- **method** `{String}`: - метод запроса. По умолчанию `POST`. Только для HTML5 браузеров.
- **removeAfterUpload** `{Boolean}` - удалить файлы после загрузки
- **isHTML5** `{Boolean}` - `true`, если это html5-загрузчик. Только для чтения.
- **isUploading** `{Boolean}` - загрузчик в процессе загрузки. Только для чтения.
- **queueLimit** `{Number}` - максимальное количество файлов
- **withCredentials** `{Boolean}` : включить CORS. Только для HTML5 браузеров.

#### Методы

- **bind** `function(event, handler) {` - регистрирует обработчик события
- **trigger** `function(event[, params ]) {` - выполняет все обработчики, связанные с данным событием
- **addToQueue** `function(items, options) {` - где _items_ [FileList|File|Input], _options_ [Object]
- **removeFromQueue** `function({Item|Index}) {` - где _value_ элемент очереди или его индекс [Item|Index]
- **clearQueue** `function() {` - удаляет все элементы из очереди
- **getIndexOfItem** `function(item) {return {Number};}` - где _item_ элемент очереди
- **getReadyItems** `function() {return {Array};}`- Возвращает элементы готовые к загрузке
- **getNotUploadedItems** `function() { return {Array};}` - возвращает массив не загруженных элементов
- **uploadItem** `function({Item|Index}) {` - где _value_ элемент очереди или его индекс [Item|Index]
- **uploadAll** `function() {` - загружает все незагруженные элементы
- **cancelItem** `function({Item|Index}) {` - где _value_ элемент очереди или его индекс [Item|Index]
- **cancelAll** `function() {` - отменяет все текущие загрузки

### Элемент очереди API:

#### Свойства

- **url** `{String}` - путь на сервере, по которому будет загружен файл
- **alias** `{String}` - псевдоним файла
- **headers** `{Object}` - заголовки, которые будут переданы вместе с файлом. Только для HTML5 браузеров.
- **formData** `{Array}` - данные, отправляемые вместе с файлом
- **method** `{String}`: - метод запроса. По умолчанию `POST`. Только для HTML5 браузеров.
- **withCredentials** `{Boolean}` : включить CORS. Только для HTML5 браузеров.
- **removeAfterUpload** `{Boolean}` - удалить файл после загрузки
- **index** `{Number}` - индекс / порядковый номер загрузки. Только для чтения.
- **progress** `{Number}` - прогресс загрузки файла. Только для чтения.
- **isReady** `{Boolean}` - файл готов к загрузке. Только для чтения.
- **isUploading** `{Boolean}` - файл в процессе загрузки. Только для чтения.
- **isUploaded** `{Boolean}` - файл загружен. Только для чтения.
- **isSuccess** `{Boolean}` - файл успешно загружен. Только для чтения.
- **isCancel** `{Boolean}` - загрузка файла была отменена. Только для чтения.
- **isError** `{Boolean}` - при загрузке файла произошла ошибка. Только для чтения.
- **uploader** `{Object}` - ссылка на загрузчик. Только для чтения.

#### Методы

- **remove** `function() {` - удаляет элемент
- **upload** `function() {` - загружает элемент
- **cancel** `function() {` - отменяет загрузку элемента

## Фильтры

### Добавить фильтр

```javascript
var uploader = $fileUploader.create({
    scope: $scope,
    filters: [
        function(item) {                    // first user filter
            return true;
        }
    ]
});

// second user filter
uploader.filters.push(function(item) {
    return true;
});
```

### Предустановленные фильтры

1. [emptyFileFilter](https://github.com/nervgh/angular-file-upload/blob/v0.4.1/src/scripts/services/%24fileUploader.js#L58)
2. [queueLimitFilter](https://github.com/nervgh/angular-file-upload/blob/v0.4.1/src/scripts/services/%24fileUploader.js#L68)

## События

### Список событий

- **afteraddingfile** `function(event, item) {` - после добавления файла в очередь
- **whenaddingfilefailed** `function(event, item) {`: когда добавление файла в очередь не удалось
- **afteraddingall** `function(event, items) {` - после добавления всех файлов в очередь
- **beforeupload** `function(event, item) {` - перед загрузкой файла
- **progress** `function(event, item, progress) {` - прогресс загрузки файла
- **success** `function(event, xhr, item, response) {` - файл успешно загружен
- **cancel** `function(event, xhr, item) {` - отменяет загрузку файла
- **error** `function(event, xhr, item[, response ]) {` - ошибка при загрузке
- **complete** `function(event, xhr, item, response) {` - файл загружен
- **progressall** `function(event, progress) {` - прогресс загрузки очереди
- **completeall** `function(event, items) {` - "очередь загружена", если была инициирована загрузка всей очереди; иначе "файл загружен", если была инициирована загрузка файла

### Подписка на событие

```javascript
var uploader = $fileUploader.create({scope: $scope});

uploader.bind('progress', function(event, item, progress) {
    console.log('Progress: ' + progress);
});
```

### FAQ / Вопросы и ответы
1. Как добавить ранее загруженные файлы в очередь?

    ```javascript
    // Add a item to the queue
    var item = {
        file: {
            name: 'Your file name',
            size: 1e6
        },
        progress: 100,
        isUploaded: true,
        isSuccess: true
    };
    item.remove = function() {
        uploader.removeFromQueue(this);
    };
    uploader.queue.push(item);
    uploader.progress = 100;
```

2. Как работать с CSRF защитой?

    См. [#40](https://github.com/nervgh/angular-file-upload/issues/40)

3. Как динамически обновлять опции?

    См. [комментарий](https://github.com/nervgh/angular-file-upload/issues/97#issuecomment-39248062)

4. Мне нужны пользовательские опции. Они существуют?

    См. [комментарий](https://github.com/nervgh/angular-file-upload/pull/104#issuecomment-39887419)
