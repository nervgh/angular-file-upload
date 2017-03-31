

// FileUploader
describe('FileUploader', function () {
  browser.get('/tests/e2e/fixtures/html5/index.html')

  describe('Initialization', function () {
    it('should initialized', function () {
      expect(element(by.binding('uploader.queue.length')).getText()).toEqual('0')
    })
  })
})