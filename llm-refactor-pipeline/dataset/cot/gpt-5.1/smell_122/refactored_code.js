it('allow unmocked option allows traffic to server', async () => {
  const serverHandler = (request, response) => {
    const routes = {
      '/': { status: 200, body: 'server served a response' },
      '/not/available': { status: 404 },
      '/abc': { status: 200, body: 'server served a response' },
    }

    const route = routes[request.url]
    if (route) {
      response.writeHead(route.status)
      if (route.body) response.write(route.body)
    }

    response.end()
  }

  const { origin } = await startHttpServer(serverHandler)

  const scope = nock(origin, { allowUnmocked: true })
    .get('/abc')
    .reply(307, 'served from our mock')
    .get('/wont/get/here')
    .reply(307, 'served from our mock')

  const client = got.extend({ prefixUrl: origin, throwHttpErrors: false })

  const assertResponse = async (path, expectedStatus, expectedBody) => {
    const response = await client(path)
    expect(response.statusCode).to.equal(expectedStatus)
    if (expectedBody !== undefined) {
      expect(response.body).to.equal(expectedBody)
    }
    expect(scope.isDone()).to.equal(false)
  }

  await assertResponse('abc', 307, 'served from our mock')
  await assertResponse('not/available', 404)
  await assertResponse('', 200, 'server served a response')
})