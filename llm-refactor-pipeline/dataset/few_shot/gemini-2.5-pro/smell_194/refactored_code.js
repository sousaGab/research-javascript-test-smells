describe('event handling', () => {
  const template = (handler) =>
    createElement('div', {
      id: 'test',
      onclick: handler,
    });

  it('should attach a click event handler', () => {
    let wasCalled = false;
    const handleClick = () => {
      wasCalled = true;
    };

    render(template(handleClick), container);
    container.querySelector('div').click();

    expect(wasCalled).toBe(true);
  });

  it('should update an existing click event handler', () => {
    let firstHandlerCalled = false;
    const firstHandler = () => {
      firstHandlerCalled = true;
    };

    let secondHandlerCalled = false;
    const secondHandler = () => {
      secondHandlerCalled = true;
    };

    render(template(firstHandler), container);
    render(template(secondHandler), container); // Re-render with the new handler

    container.querySelector('div').click();

    expect(firstHandlerCalled).toBe(false);
    expect(secondHandlerCalled).toBe(true);
  });

  it('should remove the click event handler when the element is unmounted', () => {
    let wasCalled = false;
    const handleClick = () => {
      wasCalled = true;
    };

    render(template(handleClick), container);
    const div = container.querySelector('div');

    render(null, container); // Unmount the element

    // Attempt to click the now-detached element to ensure the listener was cleaned up
    if (div) {
      div.click();
    }

    expect(wasCalled).toBe(false);
  });
});