it('should do something', () => {
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
    expect(container.firstChild.childNodes.length).toBe(6);
    expect(Array.from(container.firstChild.childNodes).map(node => node.textContent).join('')).toBe('432150');
  })