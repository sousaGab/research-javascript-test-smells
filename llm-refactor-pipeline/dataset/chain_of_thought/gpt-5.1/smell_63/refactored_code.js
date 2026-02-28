it("'cde' => [ div ]", () => {
  const fragment = document.createDocumentFragment();
  const initialDiv = createElement('div', null, 'cde');
  const nestedDiv = createElement('div', null, createElement('div', null));

  render(initialDiv, fragment);
  render(nestedDiv, fragment);

  const firstChild = fragment.firstChild;
  const { childNodes } = firstChild;
  const [onlyChild] = childNodes;

  expect(childNodes.length).toBe(1);
  expect(onlyChild.tagName).toBe('DIV');
});