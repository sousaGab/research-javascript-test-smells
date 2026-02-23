// Your COMPLETE refactored test code here

it('should not mess the Headers object', async () => {
    nock('https://api.test.com', {
      reqheaders: { 'Content-Type': 'application/json' },
    })
      .get('/data')
      .times(2)
      .reply(200)

    const headers = new Headers({ 'Content-Type': 'application/json' })

    const response1 = await fetch('https://api.test.com/data', { headers })
    const response2 = await fetch('https://api.test.com/data', { headers })

    expect(response1.headers.get('Content-Type')).toBe('application/json')
    expect(response2.headers.get('Content-Type')).toBe('application/json')
  })