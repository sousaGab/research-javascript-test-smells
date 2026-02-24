it('records and replays correctly with filteringRequestBody', async () => {
  const responseBody = '<html><body>example</body></html>'
  const origin = 'http://example.test'

  const onFilteringRequestBody = sinon.spy()

  const definition = {
    scope: origin,
    method: 'GET',
    path: '/',
    status: 200,
    response: responseBody,
    filteringRequestBody: (body, aRecodedBody) => {
      onFilteringRequestBody()
      expect(body).to.equal(aRecodedBody)
      return body
    },
  }

  const nocks = nock.define([definition])

  const response = await got(origin)
  expect(response.body).to.equal(responseBody)

  nocks.forEach(nock => nock.done())
  expect(onFilteringRequestBody).to.have.been.calledOnce()
})