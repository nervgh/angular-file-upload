

// Try Koa server with Protractor
describe('Protractor with Koa', function() {
  it('should have a title', function() {
    // https://github.com/angular/protractor/blob/master/docs/timeouts.md#waiting-for-angular-on-page-load
    browser.ignoreSynchronization = true;
    browser.get('/');

    expect(browser.getTitle()).toEqual('Hello Koa');
  });
});