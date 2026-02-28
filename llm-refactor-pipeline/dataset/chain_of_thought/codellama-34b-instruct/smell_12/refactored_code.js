// Your COMPLETE refactored test code here
it('should reorder nodes', () => {
    render(
      template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])),
      container,
    );
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
    render(
      template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])),
      container,
    );
    expect(container.textContent).toBe('1234abc6def7');
    expect(container.firstChild.childNodes.length).toBe(8);
    render(
      template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])),
      container,
    );
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
  })