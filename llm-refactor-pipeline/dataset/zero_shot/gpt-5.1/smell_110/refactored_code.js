function assertToggleBehavior() {
  expect(
    getByClass(document.body, 'foo', false, { test: true, polyfill: true }).length
  ).toBe(1);
}

it('should toggle', assertToggleBehavior);