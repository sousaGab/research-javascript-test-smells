it("'cde' => [ div ]", () => {
  const f = document.createDocumentFragment();
  const a = createElement('div', null, 'cde');
  const b = createElement('div', null, createElement('div', null));
  render(a, f);
  render(b, f);
  const firstChild = f.firstChild;
  expect(firstChild.childNodes.length).toBe(1);
  expect(firstChild.firstChild.tagName).toBe('DIV');
})