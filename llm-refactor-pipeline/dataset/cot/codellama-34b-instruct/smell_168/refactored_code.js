it('response readable pull stream works as expected', done => {
  nock('http://example.test')
    .get('/ssstream')
    .reply(200, 'this is the response body yeah')

  const req = http.request(
    {
      host: 'example.test',
      path: '/ssstream',
      port: 80,
    },
    res => {
      let ended = false
      let responseBody = ''
      expect(res.statusCode).to.equal(200)
      res.on('readable', () => {
        responseBody += res.read().toString()
        if (res.read() === null && !ended) {
          ended = true
          expect(responseBody).to.equal('this is the response body yeah')
          done()
        }
      })
    },
  )

  req.end()
})