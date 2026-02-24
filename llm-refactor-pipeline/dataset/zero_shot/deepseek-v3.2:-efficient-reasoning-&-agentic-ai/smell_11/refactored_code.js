it('should do a advanced shuffle - numbers and letters', () => {
  const testCases = [
    {
      nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
      expectedText: 'abcd123',
      expectedChildCount: 7
    },
    {
      nodes: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3],
      expectedText: '1e2bfgca3',
      expectedChildCount: 9
    },
    {
      nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
      expectedText: 'abcd123',
      expectedChildCount: 7
    },
    {
      nodes: [0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4],
      expectedText: '0e2bfgca4',
      expectedChildCount: 9
    },
    {
      nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
      expectedText: 'abcd123',
      expectedChildCount: 7
    },
    {
      nodes: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3],
      expectedText: '1e2bfgca3',
      expectedChildCount: 9
    }
  ];

  testCases.forEach(({ nodes, expectedText, expectedChildCount }) => {
    render(template(generateKeyNodes(nodes)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedChildCount);
  });
});