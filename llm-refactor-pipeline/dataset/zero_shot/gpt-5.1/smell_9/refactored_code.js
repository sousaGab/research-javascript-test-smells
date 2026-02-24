it('should not leak memory', () => {
  const eventHandler = function () {};

  function AppTwo() {
    return createElement('button', null, [2]);
  }

  function App() {
    return createElement(
      'button',
      {
        onsubmit: eventHandler,
      },
      ['1'],
    );
  }

  render(App(), container);
  const firstRenderContent = container.firstChild.innerHTML;

  render(App(), container);
  const secondRenderContent = container.firstChild.innerHTML;

  expect(firstRenderContent).toBe('1');
  expect(secondRenderContent).toBe('1');

  render(AppTwo(), container);
  expect(container.firstChild.innerHTML).toBe('2');
});