it('should toggle and return elements with matching class when toggling with test and polyfill options', function () {
    expect(getByClass(document.body, 'foo', false, { test: true, polyfill: true }).length).toBe(1)
  })