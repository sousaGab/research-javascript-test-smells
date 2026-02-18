it('should render key nodes with correct count and text content', () => {
  // Initial render with 6 nodes
  render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
  expect(container.firstChild.childNodes.length).toBe(6);
  expect(container.textContent).toBe('012345');
  
  // Re-render with different order
  render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
  expect(container.firstChild.childNodes.length).toBe(6);
  expect(container.textContent).toBe('432150');
});