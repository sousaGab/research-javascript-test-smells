it('allows unmocked option with HTTPS for partial match', async () => {
    const server = await servers.startHttpsServer((request, response) => {
      response.writeHead(201)
      response.write('foo')
      response.end()
    })

    const nock = nock(server.origin, { allowUnmocked: true })
      .get('/foo')
      .query({ foo: 'bar' })
      .reply(418)

    const { statusCode, body } = await got(`${server.origin}/foo`, {
      https: { certificateAuthority: servers.ca },
    })

    expect(statusCode).to.equal(201)
    expect(body).to.equal('foo')
  })