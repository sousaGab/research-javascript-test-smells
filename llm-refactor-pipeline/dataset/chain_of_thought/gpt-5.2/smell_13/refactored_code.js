it('should move a key with a size up', () => {
  const runAndAssert = (from, to, expectedText) => {
    render(template(generateNodes(from)), container);
    render(template(generateNodes(to)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(6);
  };

  runAndAssert(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
  runAndAssert(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
  runAndAssert(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
  runAndAssert(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
  runAndAssert(['a', '#1', '#2', '#4'], ['#0', '#1', '#2', '#4', 'a', '#5'], '#0#1#2#4a#5');
  runAndAssert(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
});