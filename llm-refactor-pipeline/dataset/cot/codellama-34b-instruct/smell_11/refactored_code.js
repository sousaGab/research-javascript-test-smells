it('should do a advanced shuffle - numbers and letters', () => {
    render(
      template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])),
      container,
    );
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);
    render(
      template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])),
      container,
    );
    expect(container.textContent).toBe('1e2bfgca3');
    expect(container.firstChild.childNodes.length).toBe(9);
    render(
      template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])),
      container,
    );
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);
    render(
      template(generateKeyNodes([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4])),
      container,
    );
    expect(container.textContent).toBe('0e2bfgca4');
    expect(container.firstChild.childNodes.length).toBe(9);
    render(
      template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])),
      container,
    );
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);
    render(
      template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])),
      container,
    );
    expect(container.textContent).toBe('1e2bfgca3');
    expect(container.firstChild.childNodes.length).toBe(9);
  })