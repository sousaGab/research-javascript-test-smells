it('with allowUnmocked, a request should hit the real server if it only partially matches a mock', async () => {
  const { origin } = await servers.startHttpsServer((request, response) => {
    response.writeHead(201)
    response.write('foo')
    response.end()
  })

  nock(origin, { allowUnmocked: true })
    .get('/foo')
    .query({ foo: 'bar' })
    .reply(418)

  const { statusCode, body } = await got(`${origin}/foo`, {
    https: { certificateAuthority: servers.ca },
  })

  expect(statusCode).to.equal(201)
  expect(body).to.equal('foo')
})