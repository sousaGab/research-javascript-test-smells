const expectedSetCookieHeaders = [
  `Zoo=boo; Max-Age=3; Domain=mafoo.com; Path=/; Expires=${expectedExpires}; HttpOnly; Secure; SameSite=Strict`,
  'Foo=bar; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Strict',
  'Fizz=buzz; Path=/'
]