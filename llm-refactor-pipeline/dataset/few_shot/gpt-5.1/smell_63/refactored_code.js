it("'cde' => [ div ]", () => {
  const fragment = document.createDocumentFragment();
  const initialElement = createElement('div', null, 'cde');
  const updatedElement = createElement('div', null, createElement('div', null));

  render(initialElement, fragment);
  render(updatedElement, fragment);

  const { firstChild } = fragment;

  expect(firstChild.childNodes).toHaveLength(1);
  expect(firstChild.firstChild.tagName).toBe('DIV');
});