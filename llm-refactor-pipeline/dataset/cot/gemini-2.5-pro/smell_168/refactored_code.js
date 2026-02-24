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
      let responseBody = ''
      expect(res.statusCode).to.equal(200)

      res.on('data', chunk => {
        responseBody += chunk.toString()
      })

      res.on('end', () => {
        expect(responseBody).to.equal('this is the response body yeah')
        done()
      })
    },
  )

  req.end()
})