it('Should stop propagating normal event to normal event', async () => {
  const eventHandlerSpy = jasmine.createSpy('spy');
  const eventHandler = function (event) {
    eventHandlerSpy();
    event.stopPropagation();
  };

  const eventHandlerSpy2 = jasmine.createSpy('spy');
  const eventHandler2 = function () {
    eventHandlerSpy2();
  };

  function SmallComponent() {
    return createElement(
      'div',
      {
        onclick: eventHandler2,
        id: 'parent',
      },
      createElement(
        'div',
        {
          onclick: eventHandler,
          id: 'tester',
        },
        '2',
      ),
    );
  }

  render(<SmallComponent />, container);

  container.querySelector('#tester').click();
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(eventHandlerSpy.calls.count()).toBe(1);
  expect(eventHandlerSpy2.calls.count()).toBe(0);
});