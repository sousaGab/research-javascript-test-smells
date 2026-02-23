test('should report no differences when rerendered with the same props', () => {
  const initialProps = { a: 1 };
  const expectedReason = {
    propsDifferences: [],
    stateDifferences: false,
    hookDifferences: false,
    ownerDifferences: false,
  };

  const { rerender } = rtl.render(<TestComponent {...initialProps} />);
  rerender(<TestComponent {...initialProps} />);

  expect(updateInfos[0].reason).toEqual(expectedReason);
  expect(updateInfos).toHaveLength(1);
});