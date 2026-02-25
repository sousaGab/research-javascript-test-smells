it('should find an element by class name when polyfill and test options are enabled', function () {
    expect(getByClass(document.body, 'foo', false, { test: true, polyfill: true }).length).toBe(1)
  })