it('should bail out early if mapState does not depend on props', () => {
  const store = createStore(stringBuilder);
  const mapStateSpy = jest.fn(state =>
    state === 'aaa' ? { change: 1 } : {},
  );
  const renderSpy = jest.fn();

  const Container = connect(mapStateSpy)(
    class Container extends Component {
      render() {
        renderSpy();
        return <Passthrough {...this.props} />;
      }
    },
  );

  const setStateSpy = jest.spyOn(Container.prototype, 'setState');

  const vNode = (
    <ProviderMock store={store}>
      <Container />
    </ProviderMock>
  );

  renderToContainer(vNode);

  expect(renderSpy).toHaveBeenCalledTimes(1);
  expect(mapStateSpy).toHaveBeenCalledTimes(1);

  const dispatchSteps = [
    { mapStateCalls: 2, renderCalls: 1, setStateCalls: 0 },
    { mapStateCalls: 3, renderCalls: 1, setStateCalls: 0 },
    { mapStateCalls: 4, renderCalls: 2, setStateCalls: 1 },
  ];

  dispatchSteps.forEach(({ mapStateCalls, renderCalls, setStateCalls }) => {
    store.dispatch({ type: 'APPEND', payload: 'a' });
    renderToContainer(vNode);

    expect(mapStateSpy).toHaveBeenCalledTimes(mapStateCalls);
    expect(renderSpy).toHaveBeenCalledTimes(renderCalls);
    expect(setStateSpy).toHaveBeenCalledTimes(setStateCalls);
  });
});