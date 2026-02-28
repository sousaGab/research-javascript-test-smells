it('should do an advanced shuffle - numbers and letters', () => {
  const assertContentAndLength = (input, expectedText, expectedLength) => {
    render(template(generateKeyNodes(input)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedLength);
  };

  assertContentAndLength(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
  assertContentAndLength([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], '1e2bfgca3', 9);
  assertContentAndLength([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4], '0e2bfgca4', 9);
});