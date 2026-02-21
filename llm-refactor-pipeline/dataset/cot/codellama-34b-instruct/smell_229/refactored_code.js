test('Same props', () => {
  const {rerender} = rtl.render(
    <TestComponent a={1}/>
  );
  const updateInfo = rerender(
    <TestComponent a={1}/>
  );

  expect(updateInfo.reason).toEqual({
    propsDifferences: [],
    stateDifferences: false,
    hookDifferences: false,
    ownerDifferences: false,
  });
  expect(updateInfo).toHaveLength(1);
})