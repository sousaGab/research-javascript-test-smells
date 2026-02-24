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

  const dispatchAndRender = (action) => {
    if (action) {
      store.dispatch(action);
    }
    renderToContainer(vNode);
  };

  const expectCounts = ({ renders, mapStates, setStates }) => {
    expect(renderCalls).toBe(renders);
    expect(mapStateCalls).toBe(mapStates);
    expect(setStateCalls).toBe(setStates);
  };

  dispatchAndRender();
  expectCounts({ renders: 1, mapStates: 1, setStates: 0 });

  dispatchAndRender({ type: 'APPEND', payload: 'a' });
  expectCounts({ renders: 1, mapStates: 2, setStates: 0 });

  dispatchAndRender({ type: 'APPEND', payload: 'a' });
  expectCounts({ renders: 1, mapStates: 3, setStates: 0 });

  dispatchAndRender({ type: 'APPEND', payload: 'a' });
  expectCounts({ renders: 2, mapStates: 4, setStates: 1 });
});