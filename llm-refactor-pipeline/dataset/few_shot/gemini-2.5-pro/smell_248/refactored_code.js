it('should not mess the Headers object', async () => {
    const scope = nock('https://api.test.com', {
      reqheaders: { 'Content-Type': 'application/json' },
    })
      .get('/data')
      .times(2)
      .reply(200);

    const headers = new Headers({ 'Content-Type': 'application/json' });

    const res1 = await fetch('https://api.test.com/data', { headers });
    const res2 = await fetch('https://api.test.com/data', { headers });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(scope.isDone()).toBe(true);
  });