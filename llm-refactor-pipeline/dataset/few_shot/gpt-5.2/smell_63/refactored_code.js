it("'cde' => [ div ]", () => {
  const f = document.createDocumentFragment();
  const a = createElement('div', null, 'cde');
  const b = createElement('div', null, createElement('div', null));

  render(a, f);
  render(b, f);

  const root = f.firstChild;
  const children = root.childNodes;

  expect(children).toHaveLength(1);
  expect(children[0].tagName).toBe('DIV');
});