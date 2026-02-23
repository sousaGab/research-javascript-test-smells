// Your COMPLETE refactored test code here

it('should toggle', function () {
    const fooElement = getByClass(document.body, 'foo', false, { test: true, polyfill: true })[0];
    expect(fooElement.classList.contains('foo')).toBe(true);
    expect(fooElement.classList.contains('bar')).toBe(false);
  })