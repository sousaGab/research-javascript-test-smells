it('allow unmocked option works with https for a partial match', async () => {
    // Set up the server and interceptors.
    const { origin } = await servers.startHttpsServer((request, response) => {
      response.writeHead(201)
      response.write('foo')
      response.end()
    })

    nock(origin, { allowUnmocked: true })
      .get('/foo')
      .query({ foo: 'bar' })
      .reply(418)

    // Make the request and validate the response.
    const { statusCode, body } = await got(`${origin}/foo`, {
      https: { certificateAuthority: servers.ca },
    })

    expect(statusCode).to.equal(201)
    expect(body).to.equal('foo')
  })