it('should render and reorder key nodes correctly', () => {
  const initialKeys = [0, 1, 2, 3, 4, 5];
  const reorderedKeys = [4, 3, 2, 1, 5, 0];
  const expectedNodeCount = initialKeys.length;
  const expectedTextContentAfterReorder = '432150';

  render(template(generateKeyNodes(initialKeys)), container);
  const initialChildNodes = container.firstChild.childNodes;

  expect(initialChildNodes.length).toBe(expectedNodeCount);

  render(template(generateKeyNodes(reorderedKeys)), container);
  const reorderedChildNodes = container.firstChild.childNodes;

  expect(container.textContent).toBe(expectedTextContentAfterReorder);
  expect(reorderedChildNodes.length).toBe(expectedNodeCount);
});