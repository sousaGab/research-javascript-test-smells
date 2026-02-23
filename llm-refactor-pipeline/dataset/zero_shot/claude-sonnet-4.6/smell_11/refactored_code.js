it('should do a advanced shuffle - numbers and letters', () => {
    const verifyRender = (keys, expectedText, expectedLength) => {
      render(template(generateKeyNodes(keys)), container);
      expect(container.textContent).toBe(expectedText);
      expect(container.firstChild.childNodes.length).toBe(expectedLength);
    };

    verifyRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
    verifyRender([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], '1e2bfgca3', 9);
    verifyRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
    verifyRender([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4], '0e2bfgca4', 9);
    verifyRender(['a', 'b', 'c', 'd', 1, 2, 3], 'abcd123', 7);
    verifyRender([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3], '1e2bfgca3', 9);
  })