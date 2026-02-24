it("'cde' => [ div ]", () => {
  const fragment = document.createDocumentFragment();
  const initialElement = createElement('div', null, 'cde');
  const updatedElement = createElement('div', null, createElement('div', null));

  render(initialElement, fragment);
  render(updatedElement, fragment);

  const container = fragment.firstChild;
  const [child] = container.childNodes;

  expect(container.childNodes).toHaveLength(1);
  expect(child.tagName).toBe('DIV');
});