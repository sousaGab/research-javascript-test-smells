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
  const response = await serverlessExpressInstance(event)

  jest.useRealTimers()

  expect(response.statusCode).toBe(200)
  expect(response.body).toBe('{}')

  switch (eventSourceName) {
    case 'azureHttpFunctionV4':
    case 'azureHttpFunctionV3':
      expect(response.cookies).toEqual([
        {
          name: 'Zoo',
          value: 'boo',
          domain: 'mafoo.com',
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'Strict',
          maxAge: 3,
          expires
        },
        {
          name: 'Foo',
          value: 'bar',
          domain: 'example.com',
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'Strict'
        },
        { name: 'Fizz', value: 'buzz', path: '/' }
      ])
      break
    default:
      expect(response.multiValueHeaders['set-cookie']).toEqual([
        `Zoo=boo; Max-Age=3; Domain=mafoo.com; Path=/; Expires=${expires.toUTCString()}; HttpOnly; Secure; SameSite=Strict`,
        'Foo=bar; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Strict',
        'Fizz=buzz; Path=/'
      ])
      break
  }
})