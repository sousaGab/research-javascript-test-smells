it('should reorder nodes', () => {
  const initialNodes = ['7', '4', '3', '2', '6', 'abc', 'def', '1'];
  const reorderedNodes = ['1', '2', '3', '4', 'abc', '6', 'def', '7'];
  const expectedText = '74326abcdef1';
  const expectedLength = 8;

  // Initial render
  render(template(generateKeyNodes(initialNodes)), container);
  expect(container.textContent).toBe(expectedText);
  expect(container.firstChild.childNodes.length).toBe(expectedLength);

  // Reorder
  render(template(generateKeyNodes(reorderedNodes)), container);

  // Render back to initial state
  render(template(generateKeyNodes(initialNodes)), container);
  expect(container.textContent).toBe(expectedText);
  expect(container.firstChild.childNodes.length).toBe(expectedLength);
});