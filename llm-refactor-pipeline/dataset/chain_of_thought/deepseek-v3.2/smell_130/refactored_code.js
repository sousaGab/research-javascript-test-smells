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
  
  const actions = [
    { type: 'APPEND', payload: 'a' },
    { type: 'APPEND', payload: 'a' },
    { type: 'APPEND', payload: 'a' }
  ];
  
  const expectedCalls = [
    { render: 1, mapState: 1, setState: 0 },
    { render: 1, mapState: 2, setState: 0 },
    { render: 1, mapState: 3, setState: 0 },
    { render: 2, mapState: 4, setState: 1 }
  ];

  renderToContainer(vNode);
  expect(renderCalls).toBe(expectedCalls[0].render);
  expect(mapStateCalls).toBe(expectedCalls[0].mapState);

  actions.forEach((action, index) => {
    store.dispatch(action);
    renderToContainer(vNode);
    
    const expected = expectedCalls[index + 1];
    expect(mapStateCalls).toBe(expected.mapState);
    expect(renderCalls).toBe(expected.render);
    expect(setStateCalls).toBe(expected.setState);
  });
})