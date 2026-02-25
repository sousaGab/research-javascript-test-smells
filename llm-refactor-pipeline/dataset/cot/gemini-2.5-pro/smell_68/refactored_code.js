describe('list rendering', () => {
  it('should render an initial list of nodes', () => {
    // Arrange
    const initialNodes = [0, 1, 2, 3, 4, 5];

    // Act
    render(template(generateKeyNodes(initialNodes)), container);

    // Assert
    expect(container.firstChild.childNodes).toHaveLength(6);
    expect(container.textContent).toBe('012345');
  });

  it('should update the list when nodes are reordered', () => {
    // Arrange: Render the initial list first
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);

    // Act: Render the reordered list
    const reorderedNodes = [4, 3, 2, 1, 5, 0];
    render(template(generateKeyNodes(reorderedNodes)), container);

    // Assert
    expect(container.firstChild.childNodes).toHaveLength(6);
    expect(container.textContent).toBe('432150');
  });
});