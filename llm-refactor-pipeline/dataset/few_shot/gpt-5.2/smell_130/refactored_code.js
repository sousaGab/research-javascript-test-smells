it('should bail out early if mapState does not depend on props', () => {
  const store = createStore(stringBuilder);
  const calls = { render: 0, mapState: 0, setState: 0 };

  const Container = connect((state) => {
    calls.mapState++;
    return state === 'aaa' ? { change: 1 } : {};
  })(
    class Container extends Component {
      render() {
        calls.render++;
        return <Passthrough {...this.props} />;
      }
    },
  );

  const oldSetState = Container.prototype.setState;
  Container.prototype.setState = function setState(...args) {
    calls.setState++;
    oldSetState.apply(this, args);
  };

  const vNode = (
    <ProviderMock store={store}>
      <Container />
    </ProviderMock>
  );

  const expectCalls = (render, mapState, setState) => {
    expect(calls.render).toBe(render);
    expect(calls.mapState).toBe(mapState);
    expect(calls.setState).toBe(setState);
  };

  const dispatchAppendAndRender = () => {
    store.dispatch({ type: 'APPEND', payload: 'a' });
    renderToContainer(vNode);
  };

  renderToContainer(vNode);
  expectCalls(1, 1, 0);

  dispatchAppendAndRender();
  expectCalls(1, 2, 0);

  dispatchAppendAndRender();
  expectCalls(1, 3, 0);

  dispatchAppendAndRender();
  expectCalls(2, 4, 1);
});