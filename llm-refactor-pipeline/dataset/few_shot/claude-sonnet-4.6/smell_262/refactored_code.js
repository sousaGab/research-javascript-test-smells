it('`isJSONContent()` returns true for application/json content type', () => {
  expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(true)
})

it('`isJSONContent()` returns true for application/json with charset', () => {
  expect(
    common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' }),
  ).to.equal(true)
})

it('`isJSONContent()` returns false for non-json content type', () => {
  expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false)
})