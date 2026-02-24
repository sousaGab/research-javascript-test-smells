describe('isJSONContent', () => {
  it('should return true when content-type is application/json', () => {
    expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(
      true,
    )
  })

  it('should return true when content-type is application/json with a charset', () => {
    expect(
      common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' }),
    ).to.equal(true)
  })

  it('should return false when content-type is not application/json', () => {
    expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false)
  })
})