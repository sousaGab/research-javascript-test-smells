it('should enable net connect', () => {
      nock.disableNetConnect()
      nockBack.setMode('wild')
      expect(nock.isNetConnectAllowed()).toBe(true)
    })