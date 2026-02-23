it("'cde' => [ div ]", () => {
  const f = document.createDocumentFragment();
  const a = createElement('div', null, 'cde');
  const b = createElement('div', null, createElement('div', null));
  render(a, f);
  render(b, f);
  const renderedNode = f.firstChild;
  expect({
    childNodesLength: renderedNode.childNodes.length,
    firstChildTagName: renderedNode.firstChild.tagName,
  }).toEqual({
    childNodesLength: 1,
    firstChildTagName: 'DIV',
  });
})