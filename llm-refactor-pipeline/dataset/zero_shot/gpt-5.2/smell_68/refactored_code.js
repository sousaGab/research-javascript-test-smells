it('should do something', () => {
  const initialKeys = [0, 1, 2, 3, 4, 5];
  const reorderedKeys = [4, 3, 2, 1, 5, 0];

  render(template(generateKeyNodes(initialKeys)), container);

  const getRenderedChildCount = () => container.firstChild.childNodes.length;

  expect(getRenderedChildCount()).toBe(initialKeys.length);

  render(template(generateKeyNodes(reorderedKeys)), container);

  expect(container.textContent).toBe(reorderedKeys.join(''));
  expect(getRenderedChildCount()).toBe(reorderedKeys.length);
});