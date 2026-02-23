it('should reorder nodes', () => {
  const assertReorderedNodes = () => {
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
  };

  render(
    template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])),
    container,
  );
  assertReorderedNodes();

  render(
    template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])),
    container,
  );
  render(
    template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])),
    container,
  );
  assertReorderedNodes();

  render(
    template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])),
    container,
  );
  assertReorderedNodes();
});