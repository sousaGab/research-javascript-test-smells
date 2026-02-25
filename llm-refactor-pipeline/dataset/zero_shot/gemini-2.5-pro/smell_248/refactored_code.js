it('should not mess the Headers object', async () => {
    const scope = nock('https://api.test.com', {
      reqheaders: { 'Content-Type': 'application/json' },
    })
      .get('/data')
      .times(2)
      .reply(200)

    const headers = new Headers({ 'Content-Type': 'application/json' })

    await fetch('https://api.test.com/data', { headers })

    // Assert that the headers object is not mutated and is reusable
    expect(headers.get('Content-Type')).toBe('application/json');

    await fetch('https://api.test.com/data', { headers })

    // Assert that both mocked requests were completed
    expect(scope.isDone()).toBe(true);
  })