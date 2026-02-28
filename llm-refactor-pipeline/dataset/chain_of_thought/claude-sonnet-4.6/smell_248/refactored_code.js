it('should not mess the Headers object', async () => {
    nock('https://api.test.com', {
      reqheaders: { 'Content-Type': 'application/json' },
    })
      .get('/data')
      .times(2)
      .reply(200)

    const headers = new Headers({ 'Content-Type': 'application/json' })

    const firstResponse = await fetch('https://api.test.com/data', { headers })
    const secondResponse = await fetch('https://api.test.com/data', { headers })

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(200)
    expect(headers.get('Content-Type')).toBe('application/json')
  })