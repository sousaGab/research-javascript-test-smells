// Your COMPLETE refactored test code here
it('should not leak memory', () => {
    const eventHandler = function () {};

    function App() {
      return createElement(
        'button',
        {
          onsubmit: eventHandler,
        },
        ['1'],
      );
    }

    function AppTwo() {
      return createElement('button', null, [2]);
    }

    render(App(), container);
    expect(container.firstChild.innerHTML).toBe('1');

    render(AppTwo(), container);
    expect(container.firstChild.innerHTML).toBe('2');
  })