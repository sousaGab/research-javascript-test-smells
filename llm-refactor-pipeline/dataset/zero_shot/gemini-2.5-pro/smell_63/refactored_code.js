it('should render a div containing another div', () => {
  const f = document.createDocumentFragment();
  const element = createElement('div', null, createElement('div', null));
  render(element, f);
  expect(f.firstChild.innerHTML).toBe('<div></div>');
});