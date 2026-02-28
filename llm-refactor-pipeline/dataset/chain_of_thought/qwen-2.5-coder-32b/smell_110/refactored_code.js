it('should toggle the foo class when called with test and polyfill options', function () {
    expect(getByClass(document.body, 'foo', false, { test: true, polyfill: true }).length).toBe(1)
  })