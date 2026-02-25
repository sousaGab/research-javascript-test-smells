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

    const response1 = await client('abc')
    expect(response1).to.include({
      statusCode: 307,
      body: 'served from our mock',
    })
    expect(scope.isDone()).to.be.false()

    const response2 = await client('not/available')
    expect(response2).to.include({ statusCode: 404 })
    expect(scope.isDone()).to.be.false()

    const response3 = await client('')
    expect(response3).to.include({
      statusCode: 200,
      body: 'server served a response',
    })
    expect(scope.isDone()).to.be.false()
  })