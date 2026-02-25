describe('template rendering', () => {
  it('should render the initial list of nodes', () => {
    const initialNodes = [0, 1, 2, 3, 4, 5];
    render(template(generateKeyNodes(initialNodes)), container);
    expect(container.firstChild.childNodes.length).toBe(initialNodes.length);
  });

  it('should update nodes when the list is reordered', () => {
    // Initial render
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);

    // Re-render with reordered data
    const updatedNodes = [4, 3, 2, 1, 5, 0];
    render(template(generateKeyNodes(updatedNodes)), container);

    expect(container.textContent).toBe(updatedNodes.join(''));
    expect(container.firstChild.childNodes.length).toBe(updatedNodes.length);
  });
});