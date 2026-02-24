it('allow unmocked option allows traffic to server', async () => {
  const SERVER_RESPONSE = 'server served a response'
  const MOCK_RESPONSE = 'served from our mock'

  const { origin } = await startHttpServer((request, response) => {
    const routes = {
      '/': { status: 200, body: SERVER_RESPONSE },
      '/not/available': { status: 404 },
      '/abc': { status: 200, body: SERVER_RESPONSE },
    }

    const route = routes[request.url] || { status: 404 }
    response.writeHead(route.status)
    if (route.body) response.write(route.body)
    response.end()
  })

  const scope = nock(origin, { allowUnmocked: true })
    .get('/abc')
    .reply(307, MOCK_RESPONSE)
    .get('/wont/get/here')
    .reply(307, MOCK_RESPONSE)

  const client = got.extend({ prefixUrl: origin, throwHttpErrors: false })

  const testCases = [
    {
      path: 'abc',
      expectedStatus: 307,
      expectedBody: MOCK_RESPONSE,
    },
    {
      path: 'not/available',
      expectedStatus: 404,
      expectedBody: undefined,
    },
    {
      path: '',
      expectedStatus: 200,
      expectedBody: SERVER_RESPONSE,
    },
  ]

  for (const { path, expectedStatus, expectedBody } of testCases) {
    const response = await client(path)
    expect(response.statusCode).to.equal(expectedStatus)
    if (expectedBody !== undefined) {
      expect(response.body).to.equal(expectedBody)
    }
    expect(scope.isDone()).to.equal(false)
  }
})