it('should toggle', function () {
    const fooElements = getByClass(document.body, 'foo', false, { test: true, polyfill: true })
    expect(fooElements.length).toBe(1)
  })