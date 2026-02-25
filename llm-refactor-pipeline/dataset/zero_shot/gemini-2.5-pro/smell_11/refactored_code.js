it('should do a advanced shuffle - numbers and letters', () => {
  const assertRenderResult = (nodes, expectedText) => {
    render(template(generateKeyNodes(nodes)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(nodes.length);
  };

  const testSequence = [{
    nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
    text: 'abcd123'
  }, {
    nodes: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3],
    text: '1e2bfgca3'
  }, {
    nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
    text: 'abcd123'
  }, {
    nodes: [0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4],
    text: '0e2bfgca4'
  }, {
    nodes: ['a', 'b', 'c', 'd', 1, 2, 3],
    text: 'abcd123'
  }, {
    nodes: [1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3],
    text: '1e2bfgca3'
  }, ];

  testSequence.forEach(({
    nodes,
    text
  }) => {
    assertRenderResult(nodes, text);
  });
});