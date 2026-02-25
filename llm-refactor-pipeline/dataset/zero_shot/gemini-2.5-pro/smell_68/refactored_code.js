describe('list rendering', () => {
  it('should render the initial list of nodes', () => {
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(6);
  });

  it('should reorder nodes correctly on a subsequent render', () => {
    // Arrange: render initial state
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);

    // Act: render reordered state
    render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);

    // Assert
    expect(container.textContent).toBe('432150');
    expect(container.firstChild.childNodes.length).toBe(6);
  });
});