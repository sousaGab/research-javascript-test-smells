it('allow unmocked option allows traffic to server', async () => {
  const { origin } = await startHttpServer((request, response) => {
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

  const scope = nock(origin, { allowUnmocked: true })
    .get('/abc')
    .reply(307, 'served from our mock')
    .get('/wont/get/here')
    .reply(307, 'served from our mock')
  const client = got.extend({ prefixUrl: origin, throwHttpErrors: false })

  const testCases = [
    {
      path: 'abc',
      expectedStatus: 307,
      expectedBody: 'served from our mock',
      shouldScopeBeDone: false
    },
    {
      path: 'not/available',
      expectedStatus: 404,
      expectedBody: undefined,
      shouldScopeBeDone: false
    },
    {
      path: '',
      expectedStatus: 200,
      expectedBody: 'server served a response',
      shouldScopeBeDone: false
    }
  ]

  for (const testCase of testCases) {
    const response = await client(testCase.path)
    expect(response.statusCode).to.equal(testCase.expectedStatus)
    if (testCase.expectedBody !== undefined) {
      expect(response.body).to.equal(testCase.expectedBody)
    }
    expect(scope.isDone()).to.equal(testCase.shouldScopeBeDone)
  }
})