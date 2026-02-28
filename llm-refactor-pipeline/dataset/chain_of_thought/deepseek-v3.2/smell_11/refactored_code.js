it('should do a advanced shuffle - numbers and letters', () => {
  const testRender = (nodes, expectedText, expectedLength) => {
    render(template(generateKeyNodes(nodes)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedLength);
  };

  testRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
  testRender([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], '1e2bfgca3', 9);
  testRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
  testRender([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4], '0e2bfgca4', 9);
  testRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
  testRender([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], '1e2bfgca3', 9);
});