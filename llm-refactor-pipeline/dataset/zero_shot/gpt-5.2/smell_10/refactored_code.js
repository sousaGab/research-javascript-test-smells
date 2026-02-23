it('should do a complex removal at the beginning', () => {
  const expectDomState = (expectedText, expectedChildCount) => {
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedChildCount);
  };

  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  expectDomState('abcd', 4);

  render(template(generateKeyNodes(['c', 'd'])), container);
  expectDomState('cd', 2);

  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  expectDomState('abcd', 4);

  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  expectDomState('abcd', 4);
});