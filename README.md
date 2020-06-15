# Angular File Upload

+ compatible with AngularJS v1.x

---

## About

**Angular File Upload** is a module for the [AngularJS](http://angularjs.org/) framework. Supports drag-n-drop upload, upload progress, validation filters and a file upload queue. It supports native HTML5 uploads, but degrades to a legacy iframe upload method for older browsers. Works with any server side platform which supports standard HTML form uploads.

When files are selected or dropped into the component, one or more filters are applied. Files which pass all filters are added to the queue. When file is added to the queue, for him is created instance of `{FileItem}` and uploader options are copied into this object. After, items in the queue (FileItems) are ready for uploading.

## Package managers

### NPM [![npm](https://img.shields.io/npm/v/angular-file-upload.svg)](https://www.npmjs.com/package/angular-file-upload)
```
npm install angular-file-upload
```
You could find this module in npm like [_angular file upload_](https://www.npmjs.com/package/angular-file-upload).

### Yarn [![npm](https://img.shields.io/npm/v/angular-file-upload.svg)](https://www.npmjs.com/package/angular-file-upload)
```
yarn add --exact angular-file-upload
```
You could find this module in yarn like [_angular file upload_](https://yarnpkg.com/en/package/angular-file-upload).

### Module Dependency

Add `'angularFileUpload'` to your module declaration:

```
var app = angular.module('my-app', [
    'angularFileUpload'
]);
```

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

## Browser compatibility
This module uses the _feature detection_ pattern for adaptation its behaviour: [fd1](https://github.com/nervgh/angular-file-upload/blob/v2.3.1/src/services/FileUploader.js#L728), 
[fd2](https://github.com/nervgh/angular-file-upload/blob/v2.3.1/examples/image-preview/directives.js#L21).

You could check out features of target browsers using http://caniuse.com/. For example, the [File API](http://caniuse.com/#feat=fileapi) feature.

| Feature/Browser  | IE 8-9 |  IE10+ | Firefox 28+ | Chrome 38+ | Safari 6+ | 
|----------|:---:|:---:|:---:|:---:|:---:|
| `<input type="file"/>` | + | + | + | + | + |
| `<input type="file" multiple/>` | - | + | + | + | + |
| Drag-n-drop | - | + | + | + | + |
| Iframe transport (only for old browsers) | + | + | + | + | + |
| XHR transport (multipart,binary) | - | + | + | + | + |
| An image preview via Canvas (not built-in) | - | + | + | + | + |
| AJAX headers | - | + | + | + | + |


## How to ask a question

### A right way to ask a question
If you have a question, please, follow next steps:
- Try to find an answer to your question using [search](https://github.com/nervgh/angular-file-upload/issues?utf8=%E2%9C%93&q=)
- If you have not found an answer, create [new issue](https://github.com/nervgh/angular-file-upload/issues/new) on issue-tracker

### Why email a question is a bad way?
When you emal me a question:
- You lose an opportunity to get an answer from other team members or users (devs)
- It requires from me to answer on same questions again and again
- It is not a rational way. For example, if everybody who use code of this project will have emailed me a question then I will be receiving ~700 emails each day =)
- It is a very slow way. I have not time for it.
