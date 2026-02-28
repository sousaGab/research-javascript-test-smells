test('track component', () => {
  const ComponentWithHooks = createTrackableComponent();
  
  ComponentWithHooks.whyDidYouRender = true;

  const { rerender } = rtl.render(
    <ComponentWithHooks a={1} />
  );
  rerender(
    <ComponentWithHooks a={2} />
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

function createTrackableComponent() {
  return function ComponentWithHooks({ a }) {
    const [currentState] = React.useState({ b: 'b' });

    return (
      <div>hi! {a} {currentState.b}</div>
    );
  };
}