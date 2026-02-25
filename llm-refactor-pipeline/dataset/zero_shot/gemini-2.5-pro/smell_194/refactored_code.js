describe('click events', () => {
  const template = (val) =>
    createElement('div', {
      id: 'test',
      onclick: val,
    });

  it('should attach an initial click event', () => {
    let wasClicked = false;
    const handleClick = () => {
      wasClicked = true;
    };

    render(template(handleClick), container);

    container.querySelector('div').click();

    expect(wasClicked).toBe(true);
  });

  it('should update the click event handler on re-render', () => {
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
    let wasClicked = false;
    const handleClick = () => {
      wasClicked = true;
    };

    render(template(handleClick), container);
    const div = container.querySelector('div'); // Get a reference to the element

    render(null, container); // Unmount the element

    div.click(); // Click the now-detached element

    expect(wasClicked).toBe(false); // The handler should have been cleaned up
  });
});