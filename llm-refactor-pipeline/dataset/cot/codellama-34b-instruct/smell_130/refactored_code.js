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