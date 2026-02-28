it('should do a complex removal at the beginning', () => {
  const expectRender = (keys, expectedText, expectedCount) => {
    render(template(generateKeyNodes(keys)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedCount);
  };

  expectRender(['a', 'b', 'c', 'd'], 'abcd', 4);
  expectRender(['c', 'd'], 'cd', 2);
  expectRender(['a', 'b', 'c', 'd'], 'abcd', 4);
});