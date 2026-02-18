it("renders nested div elements correctly", () => {
  const fragment = document.createDocumentFragment();
  const childElement = createElement('div', null, 'cde');
  const parentElement = createElement('div', null, createElement('div', null));
  
  render(childElement, fragment);
  render(parentElement, fragment);
  
  expect(fragment.firstChild).toHaveProperty('childNode', 1);
  expect(fragment.firstChild.firstChild).toHaveProperty('tagName', 'DIV');
});