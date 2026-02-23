test('set-cookie', async () => {
  const now = new Date(2022, 7, 11, 3, 30, 30);
  const maxAge = 3000;
  const expires = new Date(+now + maxAge);

  jest.useFakeTimers('modern');
  jest.setSystemTime(now);

  router.get('/cookie', (req, res) => {
    res.cookie('Zoo', 'boo', {
      domain: 'mafoo.com',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      maxAge
    });
    res.cookie('Foo', 'bar', {
      domain: 'example.com',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict'
    });
    res.cookie('Fizz', 'buzz');
    res.json({});
  });

  const event = makeEvent({
    eventSourceName,
    path: '/cookie',
    httpMethod: 'GET'
  });
  const response = await serverlessExpressInstance(event);

  jest.useRealTimers();

  const expectedSetCookieHeaders = [
    `Zoo=boo; Max-Age=3; Domain=mafoo.com; Path=/; Expires=${expires.toUTCString()}; HttpOnly; Secure; SameSite=Strict`,
    'Foo=bar; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Strict',
    'Fizz=buzz; Path=/'
  ];

  const getExpectedAzureCookies = () => [{
    name: 'Zoo',
    value: 'boo',
    domain: 'mafoo.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: maxAge / 1000,
    expires
  }, {
    name: 'Foo',
    value: 'bar',
    domain: 'example.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
  }, {
    name: 'Fizz',
    value: 'buzz',
    path: '/'
  }, ];

  const isAzure = ['azureHttpFunctionV4', 'azureHttpFunctionV3'].includes(eventSourceName);
  const expectedCookies = isAzure ? getExpectedAzureCookies() : expectedSetCookieHeaders;

  const expectedResponse = makeResponse({
    eventSourceName,
    body: '{}',
    cookies: expectedCookies,
    multiValueHeaders: {
      'set-cookie': expectedSetCookieHeaders,
      'content-length': ['2'],
      etag: ['W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"']
    },
    statusCode: 200
  });

  expect(response).toEqual(expectedResponse);
});