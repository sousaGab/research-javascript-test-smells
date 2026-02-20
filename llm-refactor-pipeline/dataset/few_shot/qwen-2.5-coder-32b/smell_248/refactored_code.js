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
    
    // Verify that headers are properly handled by checking request was made with correct headers
    expect(nock.isDone()).toBe(true)
  })