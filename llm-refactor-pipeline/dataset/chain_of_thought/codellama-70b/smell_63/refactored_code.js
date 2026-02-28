it("'cde' => [ div ]", () => {
  const f = document.createDocumentFragment();
  const a = createElement('div', null, 'cde');
  const b = createElement('div', null, createElement('div', null));
  render(a, f);
  render(b, f);
  expect(f.firstChild.childNodes.length).toBe(1);
  expect(f.firstChild.firstChild.tagName).toBe('DIV');
})