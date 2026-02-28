it('should toggle', () => {
  expect(getByClass(document.body, 'foo', false, { test: true, polyfill: true }).length).toBe(1)
})