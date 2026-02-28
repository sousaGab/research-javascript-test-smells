test('should have no prop differences and only one update info when rerendering with identical props', () => {
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