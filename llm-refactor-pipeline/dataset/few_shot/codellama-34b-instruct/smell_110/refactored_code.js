it('should toggle', function () {
    const element = getByClass(document.body, 'foo', false, { test: true, polyfill: true })[0];
    expect(element.classList.contains('foo')).toBe(true);
  })