it('should render 6 key nodes', () => {
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(6);
  });

  it('should render key nodes in the correct order', () => {
    render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
    expect(container.textContent).toBe('432150');
  });