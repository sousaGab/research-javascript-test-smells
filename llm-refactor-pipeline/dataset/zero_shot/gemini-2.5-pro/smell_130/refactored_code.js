it('should bail out early if mapState does not depend on props', () => {
  const store = createStore(stringBuilder);
  const counters = {
    renderCalls: 0,
    mapStateCalls: 0,
    setStateCalls: 0,
  };

  const Container = connect((state) => {
    counters.mapStateCalls++;
    return state === 'aaa' ? {
      change: 1
    } : {};
  })(
    class Container extends Component {
      render() {
        counters.renderCalls++;
        return <Passthrough { ...this.props
        }
        />;
      }
    },
  );

  const oldSetState = Container.prototype.setState;
  Container.prototype.setState = function setState(...args) {
    counters.setStateCalls++;
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
  expect(counters).toEqual({
    mapStateCalls: 1,
    renderCalls: 1,
    setStateCalls: 0,
  });

  store.dispatch({
    type: 'APPEND',
    payload: 'a'
  });
  renderToContainer(vNode);
  expect(counters).toEqual({
    mapStateCalls: 2,
    renderCalls: 1,
    setStateCalls: 0,
  });

  store.dispatch({
    type: 'APPEND',
    payload: 'a'
  });
  renderToContainer(vNode);
  expect(counters).toEqual({
    mapStateCalls: 3,
    renderCalls: 1,
    setStateCalls: 0,
  });

  store.dispatch({
    type: 'APPEND',
    payload: 'a'
  });
  renderToContainer(vNode);
  expect(counters).toEqual({
    mapStateCalls: 4,
    renderCalls: 2,
    setStateCalls: 1,
  });
});