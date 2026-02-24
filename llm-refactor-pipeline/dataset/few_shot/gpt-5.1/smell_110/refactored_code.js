it('should toggle when using getByClass with test and polyfill options', function shouldToggleWithOptions() {
  const elements = getByClass(document.body, 'foo', false, { test: true, polyfill: true });
  expect(elements.length).toBe(1);
})