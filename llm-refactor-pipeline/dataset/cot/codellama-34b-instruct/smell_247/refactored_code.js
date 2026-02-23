// Your COMPLETE refactored test code here

it('should enable net connect', done => {
    nock.disableNetConnect()
    nockBack.setMode('wild')
    nockBackWithFixtureLocalhost(done)
    const response = await nockBack.fixtures.localhost.get('/')
    expect(response.status).toBe(200)
    expect(response.body).toBe('Hello, world!')
})