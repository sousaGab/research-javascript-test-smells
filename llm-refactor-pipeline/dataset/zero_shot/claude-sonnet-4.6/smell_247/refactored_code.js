it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')
      
      const scope = nock('http://www.example.test').get('/').reply(200, 'hello world')
      
      nockBackWithFixtureLocalhost(err => {
        expect(nock.isActive()).to.be.true
        expect(nock.pendingMocks()).to.be.an('array')
        done(err)
      })
    })