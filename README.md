#Angular file upload

---

# Eng

##About
**File** is upload module files (html5 + iframe) to the [angular](http://angularjs.org/) framework. Supports drag-n-drop upload, upload progress, queue. In older browsers degraded to iframe uploader.<br />
[Live demo](http://nervgh.github.io/pages/angular-file-upload/).

## Requires
- the [angularjs](https://github.com/angular/angular.js) framework
- es5 (Array.indexOf, Array.filter, Array.every, Function.bind)


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
**file.upload** - модуль загрузки файлов (html5 + iframe) для фреймворка [angular](http://angularjs.org/). Поддерживает drag-n-drop загрузку, индикацию прогресса загрузки, очередь. В старых браузерах деградирует до iframe загрузчика.<br />
В общих чертах работа модуля выглядит так: директивы "ловят" файлы и добавляют их в очередь, если те прошли фильтры, после чего "загрузчик файлов" может ими (элементами очереди) манипулировать.<br />
[Live demo](http://nervgh.github.io/pages/angular-file-upload/).

## Requires / Требует
- [angularjs](https://github.com/angular/angular.js) фреймворк
- es5 (Array.indexOf, Array.filter, Array.every, Function.bind)

## Includes / Включает
### Directives / Директивы
- **ngFileSelect** - применяется к`<input type="file" />`. Выбранные файлы добавляются в очередь загрузки, если они прошли фильтры.
- **ngFileDrop** - задает область сброса файлов / элемент, который будет ловить файлы. Как правило, применяется ко всему документу. Пойманные файлы добавляются в очередь загрузки, если они прошли фильтры.
- **ngFileOver** - применяется к элементу, который будет реагировать (менять класс), когда файлы находятся над областью сброса. По умолчанию добавляется класс `ng-file-over`. Другой класс можно задать в параметре атрибута `ng-file-over="className"`.

### Service / Сервис
- **$fileUploader** - управляет очередью и загрузкой файлов

### The Uploader API / Загрузчик:
#### Properties / Свойства
- **scope** `{Object}` - ссылка на scope для обновления html. Если параметр опущен, используется `$rootScope`
- **url** `{String}` - путь на сервере, по которому будут загружаться файлы
- **alias** `{String}` - псевдоним файла
- **queue** `{Array}`- очередь загрузки
- **progress** `{Number}`- прогресс загрузки очереди
- **headers** `{Object}` - заголовки, которые будут переданы вместе с файлами
- **filters** `{Array}` - фильтры, применяемые к [файлу|элементу] перед добавлением его в очередь. Если фильтр возвращает `true`, [файл|элемент] будет добавлен в очередь
- **autoUpload** `{Boolean}` - загружать автоматически после добавления элемента в очередь
- **removeAfterUpload** `{Boolean}` - удалить файлы после загрузки
- **isUploading** `{Boolean}` - загрузчик в процессе загрузки

#### Methods / Методы
- **bind** `function( event, handler ) {` - регистрирует обработчик события
- **hasHTML5** `function() { return [Boolean];}` - проверяет, поддерживает ли браузер html5 загрузку
- **addToQueue** `function( items, options ) {` - где _items_ [FileList|File|Input], _options_ [Object]
- **removeFromQueue** `function( value ) {` - где _value_ элемент очереди или его индекс [Item|Index]
- **clearQueue** `function() {` - удаляет все элементы из очереди
- **getIndexOfItem** `function( item ) { return [Number]; }` - где _item_ элемент очереди
- **getNotUploadedItems** `function() { return [Array]; }` - возвращает массив не загруженных элементов
- **uploadItem** `function( value ) {` - где _value_ элемент очереди или его индекс [Item|Index]
- **uploadAll** `function() {` - загружает все незагруженные элементы

### The Item API / Элемент очереди:
#### Properties / Свойства
- **url** `{String}` - путь на сервере, по которому будет загружен файл
- **alias** `{String}` - псевдоним файла
- **headers** `{Object}` - заголовки, которые будут переданы вместе с файлом
- **progress** `{Number}` - прогресс загрузки файла
- **removeAfterUpload** `{Boolean}` - удалить файл после загрузки
- **isUploading** `{Boolean}` - файл в процессе загрузки
- **isUploaded** `{Boolean}` - файл загружен
- **uploader** `{Object}` - ссылка на загрузчик

#### Methods / Методы
- **remove** `function() {` - удаляет элемент
- **upload** `function() {` - загружает элемент

## Filters / Фильтры
### Add filter / Добавить фильтр
```javascript
var uploader = $fileUploader.create({
    filters: [
        function( item ) {                    // first user filter
            console.log( 'filter1' );
            return true;
        }
    ]
});

// second user filter
uploader.filters.push(function( item ) {
    console.log( 'filter2' );
    return true;
});
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
- **afteraddingfile** `function( event, item ) {` - после добавления файла в очередь
- **afteraddingall** `function( event, items ) {` - после добавления всех файлов в очередь
- **beforeupload** `function( event, items ) {` - перед загрузкой файла
- **changedqueue** `function( event, [item|items] ) {` - очередь изменена
- **progress** `function( event, item, progress ) {` - прогресс загрузки файла
- **success** `function( event, xhr, item ) {` - файл успешно загружен
- **error** `function( event, xhr, item ) {` - ошибка при загрузке
- **complete** `function( event, xhr, item ) {` - файл загружен
- **progressall** `function( event, progress ) {` - прогресс загрузки очереди
- **completeall** `function( event, items ) {` - "очередь загружена", если была инициирована загрузка всей очереди; иначе "файл загружен", если была инициирована загрузка файла

### Subscribe to event / Подписка на событие
```javascript
var uploader = $fileUploader.create();

uploader.bind( 'progress', function( event, item, progress ) {
    console.log( 'Progress: ' + progress );
});
```
