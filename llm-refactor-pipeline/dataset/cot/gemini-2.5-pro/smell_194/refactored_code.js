describe('basic click events', () => {
  const template = (onClickHandler) =>
    createElement('div', {
      id: 'test',
      onclick: onClickHandler,
    });

  const clickAllDivs = () => {
    const divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }
  };

  it('should attach a click event', () => {
    let wasCalled = false;
    const handleClick = () => {
      wasCalled = true;
    };

    render(template(handleClick), container);
    clickAllDivs();

    expect(wasCalled).toBe(true);
  });

  it('should update an existing click event', () => {
    let firstWasCalled = false;
    const firstHandleClick = () => {
      firstWasCalled = true;
    };

    let secondWasCalled = false;
    const secondHandleClick = () => {
      secondWasCalled = true;
    };

    render(template(firstHandleClick), container);
    render(template(secondHandleClick), container);
    clickAllDivs();

    expect(firstWasCalled).toBe(false);
    expect(secondWasCalled).toBe(true);
  });

  it('should remove a click event when rendered with null', () => {
    let wasCalled = false;
    const handleClick = () => {
      wasCalled = true;
    };

    render(template(handleClick), container);
    render(null, container);
    clickAllDivs();

    expect(wasCalled).toBe(false);
  });
});