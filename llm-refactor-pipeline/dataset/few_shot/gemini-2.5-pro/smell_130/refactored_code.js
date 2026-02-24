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
  expect(setStateCalls).toBe(0);

  const dispatchSteps = [{
    mapState: 2,
    render: 1,
    setState: 0
  }, {
    mapState: 3,
    render: 1,
    setState: 0
  }, {
    mapState: 4,
    render: 2,
    setState: 1
  }, ];

  dispatchSteps.forEach(step => {
    store.dispatch({
      type: 'APPEND',
      payload: 'a'
    });
    renderToContainer(vNode);

    expect(mapStateCalls).toBe(step.mapState);
    expect(renderCalls).toBe(step.render);
    expect(setStateCalls).toBe(step.setState);
  });
});