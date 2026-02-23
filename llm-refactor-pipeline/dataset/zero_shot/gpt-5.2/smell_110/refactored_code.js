it('should return one element with class "foo" when called with test and polyfill options enabled', function () {
  const elements = getByClass(document.body, 'foo', false, { test: true, polyfill: true })
  expect(elements.length).toBe(1)
})