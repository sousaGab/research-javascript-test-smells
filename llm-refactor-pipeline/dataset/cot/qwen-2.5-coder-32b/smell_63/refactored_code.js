it("renders nested elements correctly", () => {
  const fragment = document.createDocumentFragment();
  const childElement = createElement('div', null, 'cde');
  const parentElement = createElement('div', null, createElement('div', null));
  
  render(childElement, fragment);
  render(parentElement, fragment);
  
  expect(fragment.firstChild).toHaveProperty('childNodeCount', 1);
  expect(fragment.firstChild.firstChild).toHaveProperty('tagName', 'DIV');
});