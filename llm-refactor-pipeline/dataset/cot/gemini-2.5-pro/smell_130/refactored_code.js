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

      // Initial render
      renderToContainer(vNode);
      expect(renderCalls).toBe(1);
      expect(mapStateCalls).toBe(1);
      expect(setStateCalls).toBe(0);

      const testSteps = [
        {
          description: 'should not re-render if mapped state is unchanged',
          expected: { mapState: 2, render: 1, setState: 0 },
        },
        {
          description: 'should still not re-render on second unchanged state',
          expected: { mapState: 3, render: 1, setState: 0 },
        },
        {
          description: 'should re-render when mapped state changes',
          expected: { mapState: 4, render: 2, setState: 1 },
        },
      ];

      testSteps.forEach(({ description, expected }) => {
        store.dispatch({ type: 'APPEND', payload: 'a' });
        renderToContainer(vNode);
        
        expect(mapStateCalls).toBe(expected.mapState, `${description} (mapStateCalls)`);
        expect(renderCalls).toBe(expected.render, `${description} (renderCalls)`);
        expect(setStateCalls).toBe(expected.setState, `${description} (setStateCalls)`);
      });
    })