it("'cde' => [ div ]", () => {
  const fragment = document.createDocumentFragment();
  const first = createElement('div', null, 'cde');
  const second = createElement('div', null, createElement('div', null));

  render(first, fragment);
  render(second, fragment);

  const root = fragment.firstChild;
  const children = root.childNodes;

  expect(children).toHaveLength(1);
  expect(children[0].tagName).toBe('DIV');
});