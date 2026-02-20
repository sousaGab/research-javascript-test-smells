it('`isJSONContent()` returns true for JSON content types', () => {
  expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(
    true,
  )

  expect(
    common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' }),
  ).to.equal(true)
})

it('`isJSONContent()` returns false for non-JSON content types', () => {
  expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false)
})