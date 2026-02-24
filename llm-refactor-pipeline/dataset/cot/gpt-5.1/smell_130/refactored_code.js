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

  const expectCounts = ({ mapState, render, setState }) => {
    expect(mapStateCalls).toBe(mapState);
    expect(renderCalls).toBe(render);
    expect(setStateCalls).toBe(setState);
  };

  expectCounts({ mapState: 1, render: 1, setState: 0 });

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  expectCounts({ mapState: 2, render: 1, setState: 0 });

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  expectCounts({ mapState: 3, render: 1, setState: 0 });

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  expectCounts({ mapState: 4, render: 2, setState: 1 });
});