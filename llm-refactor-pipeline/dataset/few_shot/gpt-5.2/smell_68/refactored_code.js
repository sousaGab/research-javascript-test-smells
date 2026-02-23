it('should do something', () => {
  const assertChildNodeCount = (expected) => {
    expect(container.firstChild.childNodes).toHaveLength(expected);
  };

  render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
  assertChildNodeCount(6);

  render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
  expect(container).toHaveTextContent('432150');
  assertChildNodeCount(6);
});