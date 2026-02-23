it('should return one element with class "foo" when test and polyfill options are enabled', function () {
  const className = 'foo'
  const includeSubtree = false
  const options = { test: true, polyfill: true }

  const result = getByClass(document.body, className, includeSubtree, options)

  expect(result.length).toBe(1)
})