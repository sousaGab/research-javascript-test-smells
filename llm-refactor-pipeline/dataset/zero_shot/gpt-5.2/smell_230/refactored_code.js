test('track component', () => {
  function TrackedComponentWithHooks({ a }) {
    const [currentState] = React.useState({ b: 'b' });

    return <div>hi! {a} {currentState.b}</div>;
  }

  TrackedComponentWithHooks.whyDidYouRender = true;

  const { rerender } = rtl.render(<TrackedComponentWithHooks a={1} />);
  rerender(<TrackedComponentWithHooks a={2} />);

  expect(updateInfos).toHaveLength(1);
  expect(updateInfos[0].reason).toEqual({
    propsDifferences: [
      {
        pathString: 'a',
        diffType: diffTypes.different,
        prevValue: 1,
        nextValue: 2,
      },
    ],
    stateDifferences: false,
    hookDifferences: false,
    ownerDifferences: false,
  });
});