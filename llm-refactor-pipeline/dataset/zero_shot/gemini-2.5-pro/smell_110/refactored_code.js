it('should find an element by class name using the polyfill option', function () {
    expect(getByClass(document.body, 'foo', false, { test: true, polyfill: true }).length).toBe(1)
  })