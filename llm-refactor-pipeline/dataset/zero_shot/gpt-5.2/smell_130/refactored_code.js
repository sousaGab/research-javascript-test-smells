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

  const renderAndExpect = ({ mapState, render, setState }) => {
    renderToContainer(vNode);
    expect(mapStateCalls).toBe(mapState);
    expect(renderCalls).toBe(render);
    expect(setStateCalls).toBe(setState);
  };

  const dispatchAppend = (times = 1) => {
    for (let i = 0; i < times; i++) {
      store.dispatch({ type: 'APPEND', payload: 'a' });
    }
  };

  renderAndExpect({ mapState: 1, render: 1, setState: 0 });

  dispatchAppend();
  renderAndExpect({ mapState: 2, render: 1, setState: 0 });

  dispatchAppend();
  renderAndExpect({ mapState: 3, render: 1, setState: 0 });

  dispatchAppend();
  renderAndExpect({ mapState: 4, render: 2, setState: 1 });
});