it('should find one element by class name when it exists', function () {
    expect(getByClass(document.body, 'foo', false, { test: true, polyfill: true }).length).toBe(1)
  })