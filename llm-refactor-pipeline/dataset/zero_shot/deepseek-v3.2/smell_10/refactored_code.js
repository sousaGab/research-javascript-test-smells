it('should do a complex removal at the beginning', () => {
  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  expect(container.textContent).toBe('abcd');
  expect(container.firstChild.childNodes.length).toBe(4);
  
  render(template(generateKeyNodes(['c', 'd'])), container);
  expect(container.textContent).toBe('cd');
  expect(container.firstChild.childNodes.length).toBe(2);
  
  render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
  expect(container.textContent).toBe('abcd');
  expect(container.firstChild.childNodes.length).toBe(4);
})