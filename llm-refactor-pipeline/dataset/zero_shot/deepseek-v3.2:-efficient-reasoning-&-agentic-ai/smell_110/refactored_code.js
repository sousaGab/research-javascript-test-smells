it('should toggle', function testToggle() {
  const options = { test: true, polyfill: true };
  const elements = getByClass(document.body, 'foo', false, options);
  expect(elements.length).toBe(1);
})