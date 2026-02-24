it('should do a complex removal at the beginning', () => {
  const assertContainerState = (expectedText, expectedLength) => {
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedLength);
  };

  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  assertContainerState('abcd', 4);

  render(template(generateKeyNodes(['c', 'd'])), container);
  assertContainerState('cd', 2);

  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  assertContainerState('abcd', 4);
});