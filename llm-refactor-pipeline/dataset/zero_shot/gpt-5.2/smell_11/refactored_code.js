it('should do a advanced shuffle - numbers and letters', () => {
  const cases = [
    { keys: ['a', 'b', 'c', 'd', 1, 2, 3], text: 'abcd123', length: 7 },
    { keys: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], text: '1e2bfgca3', length: 9 },
    { keys: ['a', 'b', 'c', 'd', 1, 2, 3], text: 'abcd123', length: 7 },
    { keys: [0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4], text: '0e2bfgca4', length: 9 },
    { keys: ['a', 'b', 'c', 'd', 1, 2, 3], text: 'abcd123', length: 7 },
    { keys: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], text: '1e2bfgca3', length: 9 },
  ];

  const renderAndAssert = ({ keys, text, length }) => {
    render(template(generateKeyNodes(keys)), container);
    expect(container.textContent).toBe(text);
    expect(container.firstChild.childNodes.length).toBe(length);
  };

  cases.forEach(renderAndAssert);
});