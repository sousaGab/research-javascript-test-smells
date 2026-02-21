describe('isJSONContent()', () => {
  it('should return true for JSON content-type', () => {
    expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(
      true,
    )
  })

  it('should return true for JSON content-type with charset', () => {
    expect(
      common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' }),
    ).to.equal(true)
  })

  it('should return false for non-JSON content-type', () => {
    expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false)
  })
})