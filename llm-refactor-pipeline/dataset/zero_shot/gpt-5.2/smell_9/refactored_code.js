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

  const expectInnerHTMLToBe = (expected) => {
    expect(container.firstChild.innerHTML).toBe(expected);
  };

  render(App(), container);
  expectInnerHTMLToBe('1');

  render(App(), container);
  expectInnerHTMLToBe('1');

  render(AppTwo(), container);
  expectInnerHTMLToBe('2');
});