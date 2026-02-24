it('allow unmocked option allows traffic to server', async () => {
    const { origin } = await startHttpServer((request, response) => {
      switch (request.url) {
        case '/':
        case '/abc':
          response.writeHead(200)
          response.write('server served a response')
          break
        case '/not/available':
          response.writeHead(404)
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
      },
      {
        path: 'not/available',
        expectedStatus: 404,
      },
      {
        path: '',
        expectedStatus: 200,
        expectedBody: 'server served a response',
      },
    ]

    for (const { path, expectedStatus, expectedBody } of testCases) {
      const response = await client(path)
      expect(response.statusCode).to.equal(expectedStatus)
      if (expectedBody !== undefined) {
        expect(response.body).to.equal(expectedBody)
      }
      expect(scope.isDone()).to.be.false()
    }
  })