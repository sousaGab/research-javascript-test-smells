it('should toggle', function () {
    const result = getByClass(document.body, 'foo', false, { test: true, polyfill: true })
    expect(result.length).toBe(1)
  })