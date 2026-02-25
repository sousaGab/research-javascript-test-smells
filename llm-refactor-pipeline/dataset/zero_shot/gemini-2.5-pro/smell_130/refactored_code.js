it('should bail out early if mapState does not depend on props', () => {
  const store = createStore(stringBuilder);
  let renderCalls = 0;
  let mapStateCalls = 0;
  let setStateCalls = 0;

  const Container = connect((state) => {
    mapStateCalls++;
    return state === 'aaa' ? {
      change: 1
    } : {};
  })(
    class Container extends Component {
      render() {
        renderCalls++;
        return <Passthrough { ...this.props
        }
        />;
      }
    },
  );

  const oldSetState = Container.prototype.setState;
  Container.prototype.setState = function setState(...args) {
    setStateCalls++;
    oldSetState.apply(this, args);
  };

  const vNode = ( <
    ProviderMock store = {
      store
    } >
    <
    Container / >
    <
    /ProviderMock>
  );
  renderToContainer(vNode);

  expect(renderCalls).toBe(1);
  expect(mapStateCalls).toBe(1);

  const testSteps = [{
    expectedMapState: 2,
    expectedRender: 1,
    expectedSetState: 0
  }, {
    expectedMapState: 3,
    expectedRender: 1,
    expectedSetState: 0
  }, {
    expectedMapState: 4,
    expectedRender: 2,
    expectedSetState: 1
  }, ];

  testSteps.forEach(({
    expectedMapState,
    expectedRender,
    expectedSetState
  }) => {
    store.dispatch({
      type: 'APPEND',
      payload: 'a'
    });
    renderToContainer(vNode);

    expect(mapStateCalls).toBe(expectedMapState);
    expect(renderCalls).toBe(expectedRender);
    expect(setStateCalls).toBe(expectedSetState);
  });
});