describe('isJSONContent()', () => {
  it('returns true for application/json content-type', () => {
    expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(
      true,
    )
  })

  it('returns true for application/json with charset content-type', () => {
    expect(
      common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' }),
    ).to.equal(true)
  })

  it('returns false for non-JSON content-type', () => {
    expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false)
  })
})