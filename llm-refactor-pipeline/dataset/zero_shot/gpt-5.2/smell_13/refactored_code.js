it('should move a key with a size up', () => {
  const runCase = (from, to, expectedText) => {
    render(template(generateNodes(from)), container);
    render(template(generateNodes(to)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(6);
  };

  const stableFrom = ['a', '#1', '#2', '#3'];
  const stableTo = ['#0', '#1', '#2', '#3', 'a', '#5'];
  const stableExpected = '#0#1#2#3a#5';

  for (let i = 0; i < 4; i++) {
    runCase(stableFrom, stableTo, stableExpected);
  }

  runCase(['a', '#1', '#2', '#4'], ['#0', '#1', '#2', '#4', 'a', '#5'], '#0#1#2#4a#5');

  runCase(stableFrom, stableTo, stableExpected);
});