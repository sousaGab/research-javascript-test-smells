it('allow unmocked option allows traffic to server', async () => {
  const { origin } = await startHttpServer((request, response) => {
    const routes = {
      '/': { status: 200, body: 'server served a response' },
      '/not/available': { status: 404 },
      '/abc': { status: 200, body: 'server served a response' }
    }

    const route = routes[request.url]
    if (route) {
      response.writeHead(route.status)
      if (route.body) response.write(route.body)
    }
    response.end()
  })

  const scope = nock(origin, { allowUnmocked: true })
    .get('/abc')
    .reply(307, 'served from our mock')
    .get('/wont/get/here')
    .reply(307, 'served from our mock')
  const client = got.extend({ prefixUrl: origin, throwHttpErrors: false })

  const testCases = [
    { path: 'abc', expectedStatus: 307, expectedBody: 'served from our mock' },
    { path: 'not/available', expectedStatus: 404 },
    { path: '', expectedStatus: 200, expectedBody: 'server served a response' }
  ]

  for (const { path, expectedStatus, expectedBody } of testCases) {
    const response = await client(path)
    expect(response.statusCode).to.equal(expectedStatus)
    if (expectedBody) expect(response.body).to.equal(expectedBody)
    expect(scope.isDone()).to.equal(false)
  }
})