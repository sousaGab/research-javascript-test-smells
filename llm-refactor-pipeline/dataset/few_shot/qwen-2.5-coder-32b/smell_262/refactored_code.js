it('`isJSONContent()` with JSON content type', () => {
  expect(common.isJSONContent({ 'content-type': 'application/json' })).to.equal(
    true,
  )
})

it('`isJSONContent()` with JSON content type and charset', () => {
  expect(
    common.isJSONContent({ 'content-type': 'application/json; charset=utf-8' }),
  ).to.equal(true)
})

it('`isJSONContent()` with non-JSON content type', () => {
  expect(common.isJSONContent({ 'content-type': 'text/plain' })).to.equal(false)
})