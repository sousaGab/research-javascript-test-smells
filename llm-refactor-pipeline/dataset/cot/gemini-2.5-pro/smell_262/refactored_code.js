describe('isJSONContent', () => {
  it('should return true for a simple application/json content type', () => {
    expect(common.isJSONContent({ 'content-type': 'application/json' })).to.be
      .true
  })

  it('should return true for an application/json content type with a charset', () => {
    expect(
      common.isJSONContent({
        'content-type': 'application/json; charset=utf-8',
      }),
    ).to.be.true
  })

  it('should return false for a non-JSON content type', () => {
    expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.be.false
  })
})