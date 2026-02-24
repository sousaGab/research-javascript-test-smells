it('should do a complex removal at the beginning', () => {
  const expectContainerState = (text, length) => {
    expect(container.textContent).toBe(text);
    expect(container.firstChild.childNodes.length).toBe(length);
  };

  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  expectContainerState('abcd', 4);

  render(template(generateKeyNodes(['c', 'd'])), container);
  expectContainerState('cd', 2);

  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  expectContainerState('abcd', 4);
});