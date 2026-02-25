it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')

      // Assert that setting the mode to 'wild' re-enables net connect
      // by checking nock's internal option for allowing unmocked requests.
      expect(nock.options.allowUnmocked).toBe(true);

      // Continue with the original test's behavior verification.
      nockBackWithFixtureLocalhost(done)
    })