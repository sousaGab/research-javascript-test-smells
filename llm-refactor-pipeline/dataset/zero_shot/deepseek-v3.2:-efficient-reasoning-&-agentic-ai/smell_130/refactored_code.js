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
  
  renderToContainer(vNode);
  expect(renderCalls).toBe(1);
  expect(mapStateCalls).toBe(1);

  const testCases = [
    { expectedRenderCalls: 1, expectedMapStateCalls: 2, expectedSetStateCalls: 0 },
    { expectedRenderCalls: 1, expectedMapStateCalls: 3, expectedSetStateCalls: 0 },
    { expectedRenderCalls: 2, expectedMapStateCalls: 4, expectedSetStateCalls: 1 }
  ];

  testCases.forEach(({ expectedRenderCalls, expectedMapStateCalls, expectedSetStateCalls }) => {
    store.dispatch({ type: 'APPEND', payload: 'a' });
    renderToContainer(vNode);
    expect(mapStateCalls).toBe(expectedMapStateCalls);
    expect(renderCalls).toBe(expectedRenderCalls);
    expect(setStateCalls).toBe(expectedSetStateCalls);
  });
});