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

  const testSequence = [
    { action: null, expected: { render: 1, mapState: 1, setState: 0 } },
    { action: { type: 'APPEND', payload: 'a' }, expected: { render: 1, mapState: 2, setState: 0 } },
    { action: { type: 'APPEND', payload: 'a' }, expected: { render: 1, mapState: 3, setState: 0 } },
    { action: { type: 'APPEND', payload: 'a' }, expected: { render: 2, mapState: 4, setState: 1 } },
  ];

  testSequence.forEach(({ action, expected }) => {
    if (action) {
      store.dispatch(action);
    }
    renderToContainer(vNode);
    expect(mapStateCalls).toBe(expected.mapState);
    expect(renderCalls).toBe(expected.render);
    expect(setStateCalls).toBe(expected.setState);
  });
});