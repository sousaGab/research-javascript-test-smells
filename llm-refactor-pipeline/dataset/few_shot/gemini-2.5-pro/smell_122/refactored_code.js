it('allow unmocked option allows traffic to server', async () => {
  const {
    origin
  } = await startHttpServer((request, response) => {
    switch (request.url) {
      case '/':
        response.writeHead(200)
        response.write('server served a response')
        break
      case '/not/available':
        response.writeHead(404)
        break
      case '/abc':
        response.writeHead(200)
        response.write('server served a response')
        break
    }

    response.end()
  })

  const scope = nock(origin, {
      allowUnmocked: true
    })
    .get('/abc')
    .reply(307, 'served from our mock')
    .get('/wont/get/here')
    .reply(307, 'served from our mock')

  const client = got.extend({
    prefixUrl: origin,
    throwHttpErrors: false
  })

  const [mockedResponse, unmockedNotFound, unmockedOk] = await Promise.all([
    client('abc'),
    client('not/available'),
    client(''),
  ])

  expect(mockedResponse).to.include({
    statusCode: 307,
    body: 'served from our mock',
  })
  expect(unmockedNotFound).to.include({
    statusCode: 404
  })
  expect(unmockedOk).to.include({
    statusCode: 200,
    body: 'server served a response',
  })
  expect(scope.isDone()).to.be.false
})