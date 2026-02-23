test('reports deep equals hook difference when reducer returns structurally equal state', () => {
  const initialState = { b: 'b' };

  function reducer() {
    return { b: 'b' };
  }

  function ComponentWithHooks({ a }) {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    React.useLayoutEffect(() => {
      dispatch({ type: 'something' });
    }, []);

    return <div>hi! {a} {state.b}</div>;
  }

  ComponentWithHooks.whyDidYouRender = true;

  rtl.render(<ComponentWithHooks a={1} />);

  expect(updateInfos).toHaveLength(1);
  expect(updateInfos[0].reason).toEqual({
    hookDifferences: [
      {
        diffType: diffTypes.deepEquals,
        pathString: '',
        nextValue: { b: 'b' },
        prevValue: { b: 'b' },
      },
    ],
    propsDifferences: false,
    stateDifferences: false,
    ownerDifferences: false,
  });
});