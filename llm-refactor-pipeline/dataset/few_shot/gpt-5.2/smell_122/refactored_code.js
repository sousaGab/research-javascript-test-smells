it('allow unmocked option allows traffic to server', async () => {
  const SERVER_RESPONSE = 'server served a response'
  const MOCK_RESPONSE = 'served from our mock'

  const { origin } = await startHttpServer((request, response) => {
    const routes = {
      '/': { status: 200, body: SERVER_RESPONSE },
      '/not/available': { status: 404 },
      '/abc': { status: 200, body: SERVER_RESPONSE }
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
    .reply(307, MOCK_RESPONSE)
    .get('/wont/get/here')
    .reply(307, MOCK_RESPONSE)

  const client = got.extend({ prefixUrl: origin, throwHttpErrors: false })

  const assertResponse = (res, { statusCode, body, scopeDone }) => {
    expect(res.statusCode).to.equal(statusCode)
    if (body !== undefined) expect(res.body).to.equal(body)
    expect(scope.isDone()).to.equal(scopeDone)
  }

  const response1 = await client('abc')
  assertResponse(response1, { statusCode: 307, body: MOCK_RESPONSE, scopeDone: false })

  const response2 = await client('not/available')
  assertResponse(response2, { statusCode: 404, scopeDone: false })

  const response3 = await client('')
  assertResponse(response3, { statusCode: 200, body: SERVER_RESPONSE, scopeDone: false })
})