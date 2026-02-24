it('should toggle element with foo class using polyfill', function toggleFooClassWithPolyfill() {
  const elements = getByClass(document.body, 'foo', false, { test: true, polyfill: true });
  expect(elements.length).toBe(1);
});