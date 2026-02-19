test('set-cookie', async () => {
    const now = new Date(2022, 7, 11, 3, 30, 30)
    const maxAge = 3000
    const expires = new Date(+now + maxAge)
    const expectedExpires = expires.toUTCString()

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
    const response = await serverlessExpressInstance(event)

    const expectedSetCookieHeaders = [
      `Zoo=boo; Max-Age=3; Domain=mafoo.com; Path=/; Expires=${expectedExpires}; HttpOnly; Secure; SameSite=Strict`,
      'Foo=bar; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Strict',
      'Fizz=buzz; Path=/'
    ]
    const expectedResponse = makeResponse({
      eventSourceName,
      body: '{}',
      cookies: expectedSetCookieHeaders,
      multiValueHeaders: {
        'set-cookie': expectedSetCookieHeaders,
        'content-length': ['2'],
        etag: ['W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"']
      },
      statusCode: 200
    })

    jest.useRealTimers()

    if (['azureHttpFunctionV4', 'azureHttpFunctionV3'].includes(eventSourceName)) {
      expectedResponse.cookies = [
        {
          domain: 'mafoo.com',
          httpOnly: true,
          name: 'Zoo',
          path: '/',
          sameSite: 'Strict',
          secure: true,
          value: 'boo',
          maxAge: maxAge / 1000,
          expires
        },
        {
          domain: 'example.com',
          httpOnly: true,
          name: 'Foo',
          path: '/',
          sameSite: 'Strict',
          secure: true,
          value: 'bar'
        },
        { name: 'Fizz', path: '/', value: 'buzz' }
      ]
    }

    expect(response).toEqual(expectedResponse)
  })