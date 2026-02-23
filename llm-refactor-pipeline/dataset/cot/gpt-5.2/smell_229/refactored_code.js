test('does not report differences when rerendered with the same props', () => {
  const initialProps = { a: 1 };

  const { rerender } = rtl.render(<TestComponent {...initialProps} />);
  rerender(<TestComponent {...initialProps} />);

  expect(updateInfos).toHaveLength(1);
  expect(updateInfos[0].reason).toEqual({
    propsDifferences: [],
    stateDifferences: false,
    hookDifferences: false,
    ownerDifferences: false,
  });
});