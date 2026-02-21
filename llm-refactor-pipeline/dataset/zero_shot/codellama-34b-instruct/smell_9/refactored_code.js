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

    function assertInnerHTML(element, expectedHTML) {
      expect(element.firstChild.innerHTML).toBe(expectedHTML);
    }

    render(App(), container);
    assertInnerHTML(container, '1');

    render(App(), container);
    assertInnerHTML(container, '1');

    render(AppTwo(), container);
    assertInnerHTML(container, '2');
  })