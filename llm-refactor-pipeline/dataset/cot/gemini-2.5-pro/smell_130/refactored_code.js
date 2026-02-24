it('should bail out early if mapState does not depend on props', () => {
  const store = createStore(stringBuilder);
  let renderCalls = 0;
  let mapStateCalls = 0;
  let setStateCalls = 0;

  const Container = connect((state) => {
    mapStateCalls++;
    return state === 'aaa' ? { change: 1 } : {};
  })(
    class Container extends Component {
      render() {
        renderCalls++;
        return <Passthrough {...this.props} />;
      }
    },
  );

  const oldSetState = Container.prototype.setState;
  Container.prototype.setState = function setState(...args) {
    setStateCalls++;
    oldSetState.apply(this, args);
  };

  const vNode = (
    <ProviderMock store={store}>
      <Container />
    </ProviderMock>
  );

  // Initial render
  renderToContainer(vNode);
  expect(renderCalls).toBe(1);
  expect(mapStateCalls).toBe(1);
  expect(setStateCalls).toBe(0);

  const dispatchSequence = [
    // 1. state changes, but mapped props are the same => no re-render
    { expected: { mapStateCalls: 2, renderCalls: 1, setStateCalls: 0 } },
    // 2. state changes again, mapped props still same => no re-render
    { expected: { mapStateCalls: 3, renderCalls: 1, setStateCalls: 0 } },
    // 3. state changes, causing mapped props to change => re-render
    { expected: { mapStateCalls: 4, renderCalls: 2, setStateCalls: 1 } },
  ];

  dispatchSequence.forEach(({ expected }) => {
    store.dispatch({ type: 'APPEND', payload: 'a' });
    renderToContainer(vNode);

    expect(mapStateCalls).toBe(expected.mapStateCalls);
    expect(renderCalls).toBe(expected.renderCalls);
    expect(setStateCalls).toBe(expected.setStateCalls);
  });
});