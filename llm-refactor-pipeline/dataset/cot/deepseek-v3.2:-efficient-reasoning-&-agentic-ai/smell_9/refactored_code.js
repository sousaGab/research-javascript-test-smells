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
    render(App(), container);
    render(AppTwo(), container);
    expect(container.firstChild.innerHTML).toBe('2');
  })