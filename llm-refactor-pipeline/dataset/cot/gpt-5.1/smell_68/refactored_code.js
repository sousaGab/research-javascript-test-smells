it('should render initial nodes and keep correct order and count after re-render', () => {
  render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);

  const initialChildNodes = container.firstChild.childNodes;
  expect(initialChildNodes.length).toBe(6);

  render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);

  const updatedChildNodes = container.firstChild.childNodes;
  expect(container.textContent).toBe('432150');
  expect(updatedChildNodes.length).toBe(6);
});