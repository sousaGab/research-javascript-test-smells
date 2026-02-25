test('should report prop changes as the reason for an update', () => {
  const ComponentWithTrackedProps = ({a}) => {
    const [currentState] = React.useState({b: 'b'});

    return (
      <div>hi! {a} {currentState.b}</div>
    );
  };

  ComponentWithTrackedProps.whyDidYouRender = true;

  const {rerender} = rtl.render(
    <ComponentWithTrackedProps a={1}/>
  );
  rerender(
    <ComponentWithTrackedProps a={2}/>
  );

  expect(updateInfos).toHaveLength(1);
  expect(updateInfos[0].reason).toEqual({
    propsDifferences: [{
      pathString: 'a',
      diffType: diffTypes.different,
      prevValue: 1,
      nextValue: 2,
    }],
    stateDifferences: false,
    hookDifferences: false,
    ownerDifferences: false,
  });
});