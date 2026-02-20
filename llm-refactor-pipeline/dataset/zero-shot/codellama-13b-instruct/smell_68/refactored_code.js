it('should do something', () => {
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
    expect(container.textContent).toBe('432150');
    expect(container.firstChild.childNodes.length).toBe(6);

    // Refactored test code
    const nodes = container.firstChild.childNodes;
    expect(nodes.length).toBe(6);
    expect(nodes[0].textContent).toBe('4');
    expect(nodes[1].textContent).toBe('3');
    expect(nodes[2].textContent).toBe('2');
    expect(nodes[3].textContent).toBe('1');
    expect(nodes[4].textContent).toBe('5');
    expect(nodes[5].textContent).toBe('0');
  })