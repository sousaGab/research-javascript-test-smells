it('can be called without a callback', async () => {
    nock('http://example.test').get('/').delayConnection(100).reply()

    const response = await http.get('http://example.test')
    expect(response.statusCode).toBe(200)
})