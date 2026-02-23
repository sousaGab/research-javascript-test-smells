// Your COMPLETE refactored test code here
it('should do a advanced shuffle - numbers and letters', () => {
  const cases = [
    { nodes: ['a', 'b', 'c', 'd', 1, 2, 3], text: 'abcd123', length: 7 },
    { nodes: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], text: '1e2bfgca3', length: 9 },
    { nodes: ['a', 'b', 'c', 'd', 1, 2, 3], text: 'abcd123', length: 7 },
    { nodes: [0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4], text: '0e2bfgca4', length: 9 },
    { nodes: ['a', 'b', 'c', 'd', 1, 2, 3], text: 'abcd123', length: 7 },
    { nodes: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], text: '1e2bfgca3', length: 9 },
  ];

  for (const { nodes, text, length } of cases) {
    render(template(generateKeyNodes(nodes)), container);
    expect(container.textContent).toBe(text);
    expect(container.firstChild.childNodes.length).toBe(length);
  }
});