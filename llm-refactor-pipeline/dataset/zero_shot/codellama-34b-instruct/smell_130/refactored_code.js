function setup() {
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

  return { store, Container, vNode, renderCalls, mapStateCalls, setStateCalls };
}

it('should bail out early if mapState does not depend on props', () => {
  const { store, Container, vNode, renderCalls, mapStateCalls, setStateCalls } = setup();

  renderToContainer(vNode);

  expect(renderCalls).toBe(1);
  expect(mapStateCalls).toBe(1);

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  expect(mapStateCalls).toBe(2);
  expect(renderCalls).toBe(1);
  expect(setStateCalls).toBe(0);

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  expect(mapStateCalls).toBe(3);
  expect(renderCalls).toBe(1);
  expect(setStateCalls).toBe(0);

  store.dispatch({ type: 'APPEND', payload: 'a' });
  renderToContainer(vNode);
  expect(mapStateCalls).toBe(4);
  expect(renderCalls).toBe(2);
  expect(setStateCalls).toBe(1);
});