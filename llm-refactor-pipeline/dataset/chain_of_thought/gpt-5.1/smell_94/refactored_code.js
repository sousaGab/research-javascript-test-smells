it('allows unmocked HTTPS requests when interceptor only partially matches', async () => {
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