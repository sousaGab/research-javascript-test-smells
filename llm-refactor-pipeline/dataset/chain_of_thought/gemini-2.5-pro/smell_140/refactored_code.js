it('should provide the status code and body by passing them to the asynchronous callback', async () => {
    // Assumes a fake timer library like Sinon.js is available
    const clock = sinon.useFakeTimers()
    try {
      const scope = nock('http://example.test')
        .get('/')
        .reply(function (path, reqBody, cb) {
          setTimeout(function () {
            cb(null, [201, 'GHI'])
          }, 1e3)
        })

      const requestPromise = got('http://example.test')

      // Advance virtual time to trigger the setTimeout in the mock reply instantly
      await clock.tickAsync(1000)

      const { statusCode, body } = await requestPromise
      expect(statusCode).to.equal(201)
      expect(body).to.equal('GHI')

      scope.done()
    } finally {
      clock.restore()
    }
  })