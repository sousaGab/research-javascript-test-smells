it('should do an advanced shuffle - numbers and letters', () => {
  const scenarios = [
    {
      nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
      expectedText: 'abcd123',
      expectedLength: 7,
    },
    {
      nodes: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3],
      expectedText: '1e2bfgca3',
      expectedLength: 9,
    },
    {
      nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
      expectedText: 'abcd123',
      expectedLength: 7,
    },
    {
      nodes: [0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4],
      expectedText: '0e2bfgca4',
      expectedLength: 9,
    },
    {
      nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
      expectedText: 'abcd123',
      expectedLength: 7,
    },
    {
      nodes: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3],
      expectedText: '1e2bfgca3',
      expectedLength: 9,
    },
  ];

  scenarios.forEach(({ nodes, expectedText, expectedLength }) => {
    render(template(generateKeyNodes(nodes)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedLength);
  });
});