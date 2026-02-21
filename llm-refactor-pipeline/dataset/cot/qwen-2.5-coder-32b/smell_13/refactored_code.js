it('should move a key with a size up', () => {
  render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
    container,
  );
  expect(container.textContent).toBe('#0#1#2#3a#5');
  expect(container.firstChild.childNodes.length).toBe(6);
  
  // Reuse the same operations multiple times to verify consistency
  for (let i = 0; i < 4; i++) {
    render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
    render(
      template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
      container,
    );
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
  }
  
  render(template(generateNodes(['a', '#1', '#2', '#4'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#4', 'a', '#5'])),
    container,
  );
  expect(container.textContent).toBe('#0#1#2#4a#5');
  expect(container.firstChild.childNodes.length).toBe(6);
  
  render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
  render(
    template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
    container,
  );
  expect(container.textContent).toBe('#0#1#2#3a#5');
  expect(container.firstChild.childNodes.length).toBe(6);
});