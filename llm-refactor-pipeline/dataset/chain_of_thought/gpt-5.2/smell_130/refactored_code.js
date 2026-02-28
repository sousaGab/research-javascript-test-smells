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

  const renderAndExpect = ({ render, mapState, setState }) => {
    renderToContainer(vNode);
    expect(calls.render).toBe(render);
    expect(calls.mapState).toBe(mapState);
    expect(calls.setState).toBe(setState);
  };

  const dispatchAppendA = () => store.dispatch({ type: 'APPEND', payload: 'a' });

  renderAndExpect({ render: 1, mapState: 1, setState: 0 });

  dispatchAppendA();
  renderAndExpect({ render: 1, mapState: 2, setState: 0 });

  dispatchAppendA();
  renderAndExpect({ render: 1, mapState: 3, setState: 0 });

  dispatchAppendA();
  renderAndExpect({ render: 2, mapState: 4, setState: 1 });
});