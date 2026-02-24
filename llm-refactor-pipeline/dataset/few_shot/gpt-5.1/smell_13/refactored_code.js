it('should move a key with a size up', () => {
  const assertContentAndLength = (expectedText) => {
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(6);
  };

  render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
    container,
  );
  assertContentAndLength('#0#1#2#3a#5');

  render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
    container,
  );
  assertContentAndLength('#0#1#2#3a#5');

  render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
    container,
  );
  assertContentAndLength('#0#1#2#3a#5');

  render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
    container,
  );
  assertContentAndLength('#0#1#2#3a#5');

  render(template(generateNodes(['a', '#1', '#2', '#4'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#4', 'a', '#5'])),
    container,
  );
  assertContentAndLength('#0#1#2#4a#5');

  render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
    container,
  );
  assertContentAndLength('#0#1#2#3a#5');
});