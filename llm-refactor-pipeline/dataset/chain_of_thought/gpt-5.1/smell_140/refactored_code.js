it('should provide the status code and body by passing them to the asynchronous callback', async () => {
  const scope = nock('http://example.test')
    .get('/')
    .reply(201, 'GHI')

  const { statusCode, body } = await got('http://example.test')
  expect(statusCode).to.equal(201)
  expect(body).to.equal('GHI')

  scope.done()
})