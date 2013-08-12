# Eng

##About
**file.upload** is upload module files (html5 + iframe) to the [angularjs](http://angularjs.org/) framework. Supports drag-n-drop upload, upload progress, queue. In older browsers degraded to iframe uploader.
Live [demo](http://learn.javascript.ru/play/CTpiQb)

## Requires
- the [angularjs](https://github.com/angular/angular.js) framework
- the [observer](https://github.com/nervgh/angular-file-upload/blob/master/js/angular/modules/observer.js) module (pattern implementation "observer", aka "subscriber / publisher")


## Includes
### Directives
- **ngFileSelect** - applies to`<input type="file" />`. The selected files are added to the uploaded queue if they have passed the filters.
- **ngFileDrop** - set a drop area. Usually applied to the entire document. Caught files are added to the uploaded queue if they have passed the filters.
- **ngFileOver** - applied to the element, which will change the class when the files are located on the drop area. By default add a class `ng-file-over`. Another class can be specified in the parameter attribute `ng-file-over="className"`.

### Service
- **$fileUploader** - manages a queue and uploading files

Sorry for my english : )

---

# Rus

##About / О модуле
**file.upload** - модуль загрузки файлов (html5 + iframe) для фреймворка [angularjs](http://angularjs.org/). Поддерживает drag-n-drop загрузку, индикацию прогресса загрузки, очередь. В старых браузерах деградирует до iframe загрузчика.
В общих чертах работа модуля выглядит так: directives -> filters -> add to queue -> items. Директивы "ловят" файлы и добавляют их в очередь, если те прошли фильтры, после чего "загрузчик файлов" может ими (элементами очереди) манипулировать.
Live [demo](http://learn.javascript.ru/play/CTpiQb)

## Requires / Требует
- [angularjs](https://github.com/angular/angular.js) фреймворк
- модуль [observer](https://github.com/nervgh/angular-file-upload/blob/master/js/angular/modules/observer.js) (реализация шаблона "наблюдатель", он же "подписчик/издатель")

## Includes / Включает
### Directives / Директивы
- **ngFileSelect** - применяется к`<input type="file" />`. Выбранные файлы добавляются в очередь загрузки, если они прошли фильтры.
- **ngFileDrop** - задает область сброса файлов / элемент, который будет ловить файлы. Как правило, применяется ко всему документу. Пойманные файлы добавляются в очередь загрузки, если они прошли фильтры.
- **ngFileOver** - применяется к элементу, который будет реагировать (менять класс), когда файлы находятся над областью сброса. По умолчанию добавляется класс `ng-file-over`. Другой класс можно задать в параметре атрибута `ng-file-over="className"`.

### Service / Сервис
- **$fileUploader** - управляет очередью и загрузкой файлов

### The $fileUploader API:
#### Properties / Свойства
- **url** `{String}` - путь на сервере, по которому будут загружаться файлы
- **alias** `{String}` - псевдоним файла
- **queue** `{Array}`- очередь загрузки
- **headers** `{Object}` - заголовки, которые будут переданы вместе с файлами
- **autoUpload** `{Boolean}` - загружать автоматически после добавления элемента в очередь
- **removeAfterUpload** `{Boolean}` - удалить файлы после загрузки
- **filters** `{Array}` - фильтры, применяемые к [файлу|элементу] перед добавлением его в очередь. Если фильтр возвращает `true`, [файл|элемент] будет добавлен в очередь

#### Methods / Методы
- **bind** `function( event, handler ) {` - регистрирует обработчик события
- **unbind** `function( event[, handler ]) {` - удаляет обработчик(и) события
- **hasHTML5** `function() { return [Boolean];}` - проверяет, поддерживает ли браузер html5 загрузку
- **addToQueue** `function( items ) {` - где _items_ [FileList|File|Input]
- **removeFromQueue** `function( value ) {` - где _value_ элемент очереди или его индекс [Item|Index]
- **clearQueue** `function() {` - удаляет все элементы из очереди
- **getIndexOfItem** `function( item ) { return [Number]; }` - где _item_ элемент очереди
- **getNotUploadedItems** `function() { return [Array]; }` - возвращает массив не загруженных элементов
- **getTotalProgress** `function( [value] ) { return [Number]; }` - где _value_ прогресс текущего файла. Возвращает прогресс очереди. Если загрузчик находит в режиме _removeAfterUpload_, прогресс очереди равен прогрессу элемента очереди
- **uploadItem** `function( value ) {` - где _value_ элемент очереди или его индекс [Item|Index]
- **uploadAll** `function() {` - загружает все незагруженные элементы

### The Item API (элемента очереди):
#### Properties / Свойства
- **url** `{String}` - путь на сервере, по которому будет загружен файл
- **alias** `{String}` - псевдоним файла
- **headers** `{Object}` - заголовки, которые будут переданы вместе с файлом
- **removeAfterUpload** `{Boolean}` - удалить файл после загрузки
- **progress** `{Number}` - прогресс загрузки файла
- **isUploading** `{Boolean}` - файл в процессе загрузки
- **isUploaded** `{Boolean}` - файл загружен

#### Methods / Методы
- **remove** `function() {` - удаляет элемент
- **upload** `function() {` - загружает элемент

## Filters / Фильтры
### Add filter / Добавить фильтр
```javascript
$fileUploader.filters.push( function( item ) { /* code */ return {Boolean}; } );
```

### Standard filter / Стандартный фильтр
По умолчанию в массиве фильтров уже присутствует один фильтр, который имеет вид:
```javascript
function( item ) { 
	return angular.isElement( item ) ? true : !!item.size;
}
```

## Events / События
### Events list / Список событий
- **afteraddingfile** `function( item ) {` - после добавления файла в очередь
- **afteraddingall** `function( items ) {` - после добавления всех файлов в очередь
- **beforeupload** `function( items ) {` - перед загрузкой файла
- **changedqueue** `function( [item|items] ) {` - очередь изменена
- **progress** `function( event, item, progress ) {` - прогресс загрузки файла
- **success** `function( xhr, item ) {` - файл успешно загружен
- **error** `function( xhr, item ) {` - ошибка при загрузке
- **complete** `function( xhr, item ) {` - файл загружен
- **progressall** `function( progress ) {` - прогресс загрузки очереди
- **completeall** `function( items ) {` - "очередь загружена", если была инициирована загрузка всей очереди; иначе "файл загружен", если была инициирована загрузка файла

### Subscribe to event / Подписка на событие
```javascript
$fileUploader.bind( 'complete', function() {} );
```
