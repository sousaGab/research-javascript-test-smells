it('should move a key with a size up', () => {
  const testScenarios = [{
    initial: ['a', '#1', '#2', '#3'],
    updated: ['#0', '#1', '#2', '#3', 'a', '#5'],
    expectedText: '#0#1#2#3a#5',
  }, {
    initial: ['a', '#1', '#2', '#3'],
    updated: ['#0', '#1', '#2', '#3', 'a', '#5'],
    expectedText: '#0#1#2#3a#5',
  }, {
    initial: ['a', '#1', '#2', '#3'],
    updated: ['#0', '#1', '#2', '#3', 'a', '#5'],
    expectedText: '#0#1#2#3a#5',
  }, {
    initial: ['a', '#1', '#2', '#3'],
    updated: ['#0', '#1', '#2', '#3', 'a', '#5'],
    expectedText: '#0#1#2#3a#5',
  }, {
    initial: ['a', '#1', '#2', '#4'],
    updated: ['#0', '#1', '#2', '#4', 'a', '#5'],
    expectedText: '#0#1#2#4a#5',
  }, {
    initial: ['a', '#1', '#2', '#3'],
    updated: ['#0', '#1', '#2', '#3', 'a', '#5'],
    expectedText: '#0#1#2#3a#5',
  }, ];

  testScenarios.forEach(({
    initial,
    updated,
    expectedText
  }) => {
    render(template(generateNodes(initial)), container);
    render(template(generateNodes(updated)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(6);
  });
});