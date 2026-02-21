test('should not update component when props are the same', () => {
  const {rerender} = rtl.render(
    <TestComponent a={1}/>
  );
  rerender(
    <TestComponent a={1}/>
  );

  const expectedUpdateInfos = [
    {
      reason: {
        propsDifferences: [],
        stateDifferences: false,
        hookDifferences: false,
        ownerDifferences: false,
      },
    },
  ];

  expect(updateInfos).toEqual(expectedUpdateInfos);
  expect(updateInfos).toHaveLength(1);
})