// Your COMPLETE refactored test code here
it('should do something', () => {
    const template = generateKeyNodes([0, 1, 2, 3, 4, 5]);
    const container = document.createElement('div');
    render(template, container);
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template, container);
    expect(container.textContent).toBe('432150');
    expect(container.firstChild.childNodes.length).toBe(6);
  })