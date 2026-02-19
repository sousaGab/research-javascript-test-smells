it('should do something', () => {
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
    const firstRenderElement = container.firstChild;
    expect(firstRenderElement.childNodes.length).toBe(6);
    render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
    expect(container.textContent).toBe('432150');
    expect(firstRenderElement.childNodes.length).toBe(6);
  })