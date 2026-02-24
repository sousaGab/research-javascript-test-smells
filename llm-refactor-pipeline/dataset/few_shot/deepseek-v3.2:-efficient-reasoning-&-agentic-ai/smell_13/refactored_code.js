it('should move a key with a size up', () => {
  const testRenderSequence = (initialNodes, updatedNodes, expectedText) => {
    render(template(generateNodes(initialNodes)), container);
    render(template(generateNodes(updatedNodes)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(6);
  };

  testRenderSequence(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
  testRenderSequence(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
  testRenderSequence(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
  testRenderSequence(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
  testRenderSequence(['a', '#1', '#2', '#4'], ['#0', '#1', '#2', '#4', 'a', '#5'], '#0#1#2#4a#5');
  testRenderSequence(['a', '#1', '#2', '#3'], ['#0', '#1', '#2', '#3', 'a', '#5'], '#0#1#2#3a#5');
});