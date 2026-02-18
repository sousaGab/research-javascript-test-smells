it('should return true for JSON content types', () => {
  expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(
    true,
  )

  expect(
    common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' }),
  ).to.equal(true)

  expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false)
})