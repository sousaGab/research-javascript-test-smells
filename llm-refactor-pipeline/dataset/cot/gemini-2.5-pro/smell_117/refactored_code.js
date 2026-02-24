test('set-cookie', async () => {
  const now = new Date(2022, 7, 11, 3, 30, 30)
  const maxAge = 3000
  const expires = new Date(+now + maxAge)

  jest.useFakeTimers('modern')
  jest.setSystemTime(now)

  router.get('/cookie', (req, res) => {
    res.cookie('Zoo', 'boo', { domain: 'mafoo.com', secure: true, httpOnly: true, sameSite: 'Strict', maxAge })
    res.cookie('Foo', 'bar', { domain: 'example.com', secure: true, httpOnly: true, sameSite: 'Strict' })
    res.cookie('Fizz', 'buzz')
    res.json({})
  })
  const event = makeEvent({
    eventSourceName,
    path: '/cookie',
    httpMethod: 'GET'
  })

  const createExpectedResponse = (sourceName) => {
    const expectedExpires = expires.toUTCString()
    const baseResponse = {
      eventSourceName: sourceName,
      body: '{}',
      statusCode: 200,
      multiValueHeaders: {
        'content-length': ['2'],
        etag: ['W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"']
      }
    }

    switch (sourceName) {
      case 'azureHttpFunctionV4':
      case 'azureHttpFunctionV3':
        return {
          ...baseResponse,
          cookies: [{
            name: 'Zoo',
            value: 'boo',
            domain: 'mafoo.com',
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: maxAge / 1000,
            expires,
            path: '/'
          }, {
            name: 'Foo',
            value: 'bar',
            domain: 'example.com',
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            path: '/'
          }, { name: 'Fizz', value: 'buzz', path: '/' }]
        }
      default:
        const stringCookies = [
          `Zoo=boo; Max-Age=3; Domain=mafoo.com; Path=/; Expires=${expectedExpires}; HttpOnly; Secure; SameSite=Strict`,
          'Foo=bar; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Strict',
          'Fizz=buzz; Path=/'
        ]
        return {
          ...baseResponse,
          cookies: stringCookies,
          multiValueHeaders: {
            ...baseResponse.multiValueHeaders,
            'set-cookie': stringCookies
          }
        }
    }
  }

  const response = await serverlessExpressInstance(event)
  const expectedResponse = createExpectedResponse(eventSourceName)

  jest.useRealTimers()

  expect(response).toEqual(expectedResponse)
})