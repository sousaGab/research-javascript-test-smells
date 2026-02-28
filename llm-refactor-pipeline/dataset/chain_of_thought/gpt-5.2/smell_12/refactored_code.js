it('should reorder nodes', () => {
  const expectRendered = (expectedText, expectedCount) => {
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedCount);
  };

  render(
    template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])),
    container,
  );
  expectRendered('74326abcdef1', 8);

  render(
    template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])),
    container,
  );
  render(
    template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])),
    container,
  );

  render(
    template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])),
    container,
  );

  expectRendered('74326abcdef1', 8);
});