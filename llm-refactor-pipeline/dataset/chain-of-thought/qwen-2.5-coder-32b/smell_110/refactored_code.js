it('should toggle the foo class', function () {
    const elements = getByClass(document.body, 'foo', false, { test: true, polyfill: true })
    expect(elements.length).toBe(1)
  })