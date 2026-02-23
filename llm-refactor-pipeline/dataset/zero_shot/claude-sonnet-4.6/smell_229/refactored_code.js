describe('Same props', () => {
  test('should have no prop differences when rerendered with same props', () => {
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
  });

  test('should record exactly one update when rerendered with same props', () => {
    const {rerender} = rtl.render(
      <TestComponent a={1}/>
    );
    rerender(
      <TestComponent a={1}/>
    );

    expect(updateInfos).toHaveLength(1);
  });
});