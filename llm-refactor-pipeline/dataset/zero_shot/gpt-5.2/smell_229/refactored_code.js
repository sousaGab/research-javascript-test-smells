test('does not report differences when rerendered with identical props', () => {
  const props = { a: 1 };
  const expectedReason = {
    propsDifferences: [],
    stateDifferences: false,
    hookDifferences: false,
    ownerDifferences: false,
  };

  const { rerender } = rtl.render(<TestComponent {...props} />);
  rerender(<TestComponent {...props} />);

  expect(updateInfos).toHaveLength(1);
  expect(updateInfos[0].reason).toEqual(expectedReason);
});