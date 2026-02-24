it('should render and update key nodes correctly', () => {
  const initialKeys = [0, 1, 2, 3, 4, 5];
  const updatedKeys = [4, 3, 2, 1, 5, 0];
  const expectedInitialNodeCount = initialKeys.length;
  const expectedUpdatedNodeCount = updatedKeys.length;
  const expectedUpdatedTextContent = '432150';

  render(template(generateKeyNodes(initialKeys)), container);

  const initialChildNodes = container.firstChild.childNodes;
  expect(initialChildNodes.length).toBe(expectedInitialNodeCount);

  render(template(generateKeyNodes(updatedKeys)), container);

  expect(container.textContent).toBe(expectedUpdatedTextContent);

  const updatedChildNodes = container.firstChild.childNodes;
  expect(updatedChildNodes.length).toBe(expectedUpdatedNodeCount);
});