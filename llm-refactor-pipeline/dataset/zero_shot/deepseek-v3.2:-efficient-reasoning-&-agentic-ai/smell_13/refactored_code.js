it('should move a key with a size up', () => {
  const testCases = [
    {
      firstRender: ['a', '#1', '#2', '#3'],
      secondRender: ['#0', '#1', '#2', '#3', 'a', '#5'],
      expectedText: '#0#1#2#3a#5',
      expectedLength: 6
    },
    {
      firstRender: ['a', '#1', '#2', '#4'],
      secondRender: ['#0', '#1', '#2', '#4', 'a', '#5'],
      expectedText: '#0#1#2#4a#5',
      expectedLength: 6
    }
  ];

  const executeTestCase = (firstNodes, secondNodes, expectedText, expectedLength) => {
    render(template(generateNodes(firstNodes)), container);
    render(template(generateNodes(secondNodes)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedLength);
  };

  executeTestCase(testCases[0].firstRender, testCases[0].secondRender, testCases[0].expectedText, testCases[0].expectedLength);
  executeTestCase(testCases[0].firstRender, testCases[0].secondRender, testCases[0].expectedText, testCases[0].expectedLength);
  executeTestCase(testCases[0].firstRender, testCases[0].secondRender, testCases[0].expectedText, testCases[0].expectedLength);
  executeTestCase(testCases[0].firstRender, testCases[0].secondRender, testCases[0].expectedText, testCases[0].expectedLength);
  executeTestCase(testCases[1].firstRender, testCases[1].secondRender, testCases[1].expectedText, testCases[1].expectedLength);
  executeTestCase(testCases[0].firstRender, testCases[0].secondRender, testCases[0].expectedText, testCases[0].expectedLength);
});