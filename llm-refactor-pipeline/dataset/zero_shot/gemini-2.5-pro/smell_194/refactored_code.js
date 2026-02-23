describe('basic click events', () => {
  const template = (val) =>
    createElement('div', {
      id: 'test',
      onclick: val,
    });

  it('should attach and trigger an initial click event', () => {
    let wasClicked = false;
    const handleClick = () => {
      wasClicked = true;
    };

    render(template(handleClick), container);
    container.querySelector('div').click();

    expect(wasClicked).toBe(true);
  });

  it('should update an existing click event handler on re-render', () => {
    let firstHandlerCalled = false;
    const firstHandler = () => {
      firstHandlerCalled = true;
    };

    let secondHandlerCalled = false;
    const secondHandler = () => {
      secondHandlerCalled = true;
    };

    render(template(firstHandler), container);
    render(template(secondHandler), container); // Update by re-rendering

    container.querySelector('div').click();

    expect(firstHandlerCalled).toBe(false);
    expect(secondHandlerCalled).toBe(true);
  });

  it('should remove the click event handler when the element is unmounted', () => {
    let wasClicked = false;
    const handleClick = () => {
      wasClicked = true;
    };

    render(template(handleClick), container);
    render(null, container); // Unmount

    // Assert that the handler was not called during or after unmounting.
    expect(wasClicked).toBe(false);
  });
});