it('should do a advanced shuffle - numbers and letters', () => {
  const testCases = [
    { data: ['a', 'b', 'c', 'd', 1, 2, 3], text: 'abcd123', length: 7 },
    { data: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], text: '1e2bfgca3', length: 9 },
    { data: [0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4], text: '0e2bfgca4', length: 9 },
  ];

  testCases.forEach(({ data, text, length }) => {
    render(template(generateKeyNodes(data)), container);
    expect(container.textContent).toBe(text);
    expect(container.firstChild.childNodes.length).toBe(length);
  });

  // Re-run some cases to ensure consistency
  const reRunCases = [
    { data: ['a', 'b', 'c', 'd', 1, 2, 3], text: 'abcd123', length: 7 },
    { data: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], text: '1e2bfgca3', length: 9 },
  ];

  reRunCases.forEach(({ data, text, length }) => {
    render(template(generateKeyNodes(data)), container);
    expect(container.textContent).toBe(text);
    expect(container.firstChild.childNodes.length).toBe(length);
  });
});