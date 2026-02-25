it('should find a single element by its class name', function () {
    expect(getByClass(document.body, 'foo', false, { test: true, polyfill: true }).length).toBe(1)
  })