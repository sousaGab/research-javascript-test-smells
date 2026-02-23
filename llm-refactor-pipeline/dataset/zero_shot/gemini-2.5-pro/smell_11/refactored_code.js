it('should do a advanced shuffle - numbers and letters', () => {
  const testCases = [{
    input: ['a', 'b', 'c', 'd', 1, 2, 3],
    expectedText: 'abcd123',
    expectedLength: 7
  }, {
    input: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3],
    expectedText: '1e2bfgca3',
    expectedLength: 9
  }, {
    input: ['a', 'b', 'c', 'd', 1, 2, 3],
    expectedText: 'abcd123',
    expectedLength: 7
  }, {
    input: [0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4],
    expectedText: '0e2bfgca4',
    expectedLength: 9
  }, {
    input: ['a', 'b', 'c', 'd', 1, 2, 3],
    expectedText: 'abcd123',
    expectedLength: 7
  }, {
    input: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3],
    expectedText: '1e2bfgca3',
    expectedLength: 9
  }, ];

  testCases.forEach(({
    input,
    expectedText,
    expectedLength
  }) => {
    render(template(generateKeyNodes(input)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedLength);
  });
});