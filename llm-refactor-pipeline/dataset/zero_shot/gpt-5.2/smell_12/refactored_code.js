it('should reorder nodes', () => {
  const assertOrderAndCount = (expectedText, expectedCount) => {
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedCount);
  };

  const initialOrder = ['7', '4', '3', '2', '6', 'abc', 'def', '1'];
  const alternateOrder = ['1', '2', '3', '4', 'abc', '6', 'def', '7'];

  render(template(generateKeyNodes(initialOrder)), container);
  assertOrderAndCount('74326abcdef1', 8);

  render(template(generateKeyNodes(alternateOrder)), container);
  render(template(generateKeyNodes(initialOrder)), container);
  assertOrderAndCount('74326abcdef1', 8);

  render(template(generateKeyNodes(initialOrder)), container);
  assertOrderAndCount('74326abcdef1', 8);
});