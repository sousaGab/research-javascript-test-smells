test('should report no prop, state, hook, or owner differences on re-render with identical props', () => {
  const {rerender} = rtl.render(
    <TestComponent a={1}/>
  );
  rerender(
    <TestComponent a={1}/>
  );

  expect(updateInfos[0].reason).toEqual({
    propsDifferences: [],
    stateDifferences: false,
    hookDifferences: false,
    ownerDifferences: false,
  });
  expect(updateInfos).toHaveLength(1);
})