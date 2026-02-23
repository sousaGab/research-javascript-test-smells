it('should reorder nodes', () => {
  const initialNodes = ['7', '4', '3', '2', '6', 'abc', 'def', '1'];
  const reorderedNodes = ['1', '2', '3', '4', 'abc', '6', 'def', '7'];

  const assertState = (expectedText) => {
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(8);
  };

  // Initial render
  render(template(generateKeyNodes(initialNodes)), container);
  assertState('74326abcdef1');

  // Reorder
  render(template(generateKeyNodes(reorderedNodes)), container);
  assertState('1234abc6def7');

  // Reorder back to initial state
  render(template(generateKeyNodes(initialNodes)), container);
  assertState('74326abcdef1');
});