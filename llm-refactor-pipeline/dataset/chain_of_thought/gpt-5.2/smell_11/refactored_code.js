it('should do a advanced shuffle - numbers and letters', () => {
  const assertRender = (keys, expectedText, expectedLength) => {
    render(template(generateKeyNodes(keys)), container);
    expect(container.textContent).toBe(expectedText);
    expect(container.firstChild.childNodes.length).toBe(expectedLength);
  };

  assertRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
  assertRender([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], '1e2bfgca3', 9);
  assertRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
  assertRender([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4], '0e2bfgca4', 9);
  assertRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
  assertRender([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], '1e2bfgca3', 9);
});