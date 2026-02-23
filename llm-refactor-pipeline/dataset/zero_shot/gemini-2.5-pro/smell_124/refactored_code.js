it('uses a custom filteringRequestBody function when defining a mock', async () => {
    const responseBody = '<html><body>example</body></html>'
    const origin = 'http://example.test'
    const onFilteringRequestBody = sinon.spy()

    const definition = {
      scope: origin,
      method: 'GET',
      path: '/',
      body: '',
      status: 200,
      response: responseBody,
      filteringRequestBody: (body, recordedBody) => {
        onFilteringRequestBody()
        expect(body).to.equal(recordedBody)
        return body
      },
    }

    const [scope] = nock.define([definition])

    const response = await got(origin)

    expect(response.body).to.equal(responseBody)
    scope.done()
    expect(onFilteringRequestBody).to.have.been.calledOnce()
  })