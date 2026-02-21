describe('isJSONContent()', () => {
  it('should return true for JSON content types', () => {
    expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(true)
    expect(common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' })).to.equal(true)
  })

  it('should return false for non-JSON content types', () => {
    expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false)
  })
})