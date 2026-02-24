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

  const assertCounts = (expected) => {
    expect(mapStateCalls).toBe(expected.mapState);
    expect(renderCalls).toBe(expected.render);
    expect(setStateCalls).toBe(expected.setState);
  };

  assertCounts({ mapState: 1, render: 1, setState: 0 });

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  assertCounts({ mapState: 2, render: 1, setState: 0 });

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  assertCounts({ mapState: 3, render: 1, setState: 0 });

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  assertCounts({ mapState: 4, render: 2, setState: 1 });
});