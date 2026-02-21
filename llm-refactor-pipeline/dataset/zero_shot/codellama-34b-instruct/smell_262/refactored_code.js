it('should return true for JSON content-type', () => {
  expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(
    true,
    'JSON content-type should be detected as JSON'
  )

  expect(
    common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' }),
  ).to.equal(true, 'JSON content-type with charset should be detected as JSON')

  expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false, 'Non-JSON content-type should not be detected as JSON')
})