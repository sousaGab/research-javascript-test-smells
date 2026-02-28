it("'cde' => [ div ]", () => {
  const fragment = document.createDocumentFragment();
  const elementA = createElement('div', null, 'cde');
  const elementB = createElement('div', null, createElement('div', null));
  
  render(elementA, fragment);
  render(elementB, fragment);
  
  const firstChild = fragment.firstChild;
  expect(firstChild.childNodes).toHaveLength(1);
  expect(firstChild.firstChild.tagName).toBe('DIV');
})