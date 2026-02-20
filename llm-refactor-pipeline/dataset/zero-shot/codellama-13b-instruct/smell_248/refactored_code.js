it('should not mess the Headers object', async () => {
    nock('https://api.test.com', {
      reqheaders: { 'Content-Type': 'application/json' },
    })
      .get('/data')
      .times(2)
      .reply(200)

    const headers = new Headers({ 'Content-Type': 'application/json' })

    await fetch('https://api.test.com/data', { headers })
    await fetch('https://api.test.com/data', { headers })

    expect(headers).toEqual(new Headers({ 'Content-Type': 'application/json' }))
  })