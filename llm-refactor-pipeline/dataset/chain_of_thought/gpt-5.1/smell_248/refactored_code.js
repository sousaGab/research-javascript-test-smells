it('should not mess the Headers object', async () => {
  const scope = nock('https://api.test.com', {
    reqheaders: { 'Content-Type': 'application/json' },
  })
    .get('/data')
    .times(2)
    .reply(200)

  const headers = new Headers({ 'Content-Type': 'application/json' })

  await fetch('https://api.test.com/data', { headers })
  await fetch('https://api.test.com/data', { headers })

  // Ensure the mock expectations were met (both calls with correct headers)
  expect(scope.isDone()).toBe(true)

  // Ensure the Headers object was not modified
  expect(headers.get('Content-Type')).toBe('application/json')
  expect([...headers.keys()]).toEqual(['content-type'])
})