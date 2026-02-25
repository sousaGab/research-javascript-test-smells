it('bypasses a partially matching interceptor when allowUnmocked is true', async () => {
    const { origin } = await servers.startHttpsServer((request, response) => {
      response.writeHead(201)
      response.write('foo')
      response.end()
    })

    nock(origin, { allowUnmocked: true })
      .get('/foo')
      .query({ foo: 'bar' })
      .reply(418)

    // This request matches the path but not the query of the interceptor above.
    // Because `allowUnmocked` is true, it should fall through to the real server.
    const { statusCode, body } = await got(`${origin}/foo`, {
      https: { certificateAuthority: servers.ca },
    })

    expect(statusCode).to.equal(201)
    expect(body).to.equal('foo')
  })