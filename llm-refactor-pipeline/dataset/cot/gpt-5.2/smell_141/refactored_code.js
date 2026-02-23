// Your COMPLETE refactored test code here
it('prevents the request from completing', done => {
  const onRequest = sinon.spy();

  nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK');

  http.get('http://example.test', onRequest);

  // Ensure pending requests are aborted before the delayed connection can complete.
  setImmediate(() => {
    nock.abortPendingRequests();

    // Allow the abort/error to propagate through the event loop, then assert.
    setImmediate(() => {
      expect(onRequest).not.to.have.been.called();
      done();
    });
  });
});