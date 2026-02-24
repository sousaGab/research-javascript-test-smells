it('should move a key with a size up', () => {
  const assertContainerState = (expectedText) => {
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(6);
  };

  const renderSequence = (innerNodes, outerNodes, expectedText) => {
    render(template(generateNodes(innerNodes)), container);
    render(template(generateNodes(outerNodes)), container);
    assertContainerState(expectedText);
  };

  renderSequence(
    ['a', '#1', '#2', '#3'],
    ['#0', '#1', '#2', '#3', 'a', '#5'],
    '#0#1#2#3a#5'
  );

  renderSequence(
    ['a', '#1', '#2', '#3'],
    ['#0', '#1', '#2', '#3', 'a', '#5'],
    '#0#1#2#3a#5'
  );

  renderSequence(
    ['a', '#1', '#2', '#3'],
    ['#0', '#1', '#2', '#3', 'a', '#5'],
    '#0#1#2#3a#5'
  );

  renderSequence(
    ['a', '#1', '#2', '#3'],
    ['#0', '#1', '#2', '#3', 'a', '#5'],
    '#0#1#2#3a#5'
  );

  renderSequence(
    ['a', '#1', '#2', '#4'],
    ['#0', '#1', '#2', '#4', 'a', '#5'],
    '#0#1#2#4a#5'
  );

  renderSequence(
    ['a', '#1', '#2', '#3'],
    ['#0', '#1', '#2', '#3', 'a', '#5'],
    '#0#1#2#3a#5'
  );
});