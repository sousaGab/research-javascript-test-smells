// Your COMPLETE refactored test code here
it('should return one element with class "foo" when called with polyfill options enabled', function () {
  const className = 'foo'
  const includeRoot = false
  const options = { test: true, polyfill: true }

  const result = getByClass(document.body, className, includeRoot, options)

  expect(result.length).toBe(1)
})