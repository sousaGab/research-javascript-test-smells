it('should move a key with a size up', () => {
  const testData = [
    { nodes: ['a', '#1', '#2', '#3'], expectedText: '#0#1#2#3a#5', expectedLength: 6 },
    { nodes: ['a', '#1', '#2', '#4'], expectedText: '#0#1#2#4a#5', expectedLength: 6 }
  ];

  for (const { nodes, expectedText, expectedLength } of testData) {
    render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
    render(template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])), container);
    
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedLength);
  }
});