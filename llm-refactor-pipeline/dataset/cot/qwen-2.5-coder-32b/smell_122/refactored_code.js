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

    const makeRequest = async (path, expectedStatus, expectedBody = null) => {
      const response = await client(path)
      expect(response.statusCode).to.equal(expectedStatus)
      if (expectedBody !== null) {
        expect(response.body).to.equal(expectedBody)
      }
      expect(scope.isDone()).to.equal(false)
    }

    await makeRequest('/abc', 307, 'served from our mock')
    await makeRequest('/not/available', 404)
    await makeRequest('', 200, 'server served a response')
  })