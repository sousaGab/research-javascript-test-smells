describe('event handling', () => {
  const template = (val) =>
    createElement('div', {
      id: 'test',
      onclick: val,
    });

  it('should attach a click event handler', () => {
    let called = false;
    const handleClick = () => {
      called = true;
    };

    render(template(handleClick), container);

    const div = container.querySelector('div');
    div.click();

    expect(called).toBe(true);
  });

  it('should update a click event handler', () => {
    let calledFirst = false;
    const handleFirstClick = () => {
      calledFirst = true;
    };

    let calledSecond = false;
    const handleSecondClick = () => {
      calledSecond = true;
    };

    render(template(handleFirstClick), container);
    render(template(handleSecondClick), container);

    const div = container.querySelector('div');
    div.click();

    expect(calledFirst).toBe(false);
    expect(calledSecond).toBe(true);
  });

  it('should remove a click event handler when rendered with null', () => {
    let called = false;
    const handleClick = () => {
      called = true;
    };

    render(template(handleClick), container);
    render(null, container);

    // After rendering null, the element is removed, so no click can be triggered.
    const divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }

    expect(called).toBe(false);
  });
});