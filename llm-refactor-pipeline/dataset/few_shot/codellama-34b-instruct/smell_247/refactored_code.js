it('should enable net connect', async () => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  const response = await nockBackWithFixtureLocalhost()
  expect(response.status).toBe(200)
})