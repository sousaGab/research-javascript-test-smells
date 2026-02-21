it('prevents the request from completing', async () => {
  const onRequest = sinon.spy()

  nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

  const request = http.get('http://example.test', onRequest)

  await new Promise((resolve, reject) => {
    request.on('error', (err) => {
      expect(err).to.be.an('error')
      resolve()
    })
  })

  expect(onRequest).not.to.have.been.called()
})