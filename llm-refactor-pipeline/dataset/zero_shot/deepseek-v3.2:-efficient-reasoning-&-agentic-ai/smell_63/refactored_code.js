it("'cde' => [ div ]", () => {
  const fragment = document.createDocumentFragment();
  const elementA = createElement('div', null, 'cde');
  const elementB = createElement('div', null, createElement('div', null));
  
  render(elementA, fragment);
  render(elementB, fragment);
  
  const rootElement = fragment.firstChild;
  expect(rootElement.childNodes.length).toBe(1);
  expect(rootElement.firstChild.tagName).toBe('DIV');
})