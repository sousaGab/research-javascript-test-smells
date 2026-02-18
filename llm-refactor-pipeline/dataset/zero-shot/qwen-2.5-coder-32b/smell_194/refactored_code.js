it('should attach basic click events', (done) => {
    const template = (val) =>
      createElement('div', {
        id: 'test',
        onclick: val,
      });

    let calledFirstTest = false;

    function test() {
      calledFirstTest = true;
    }

    // different event
    let calledSecondTest = false;

    function test2() {
      calledSecondTest = true;
    }

    render(template(test), container);

    let divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }
    expect(calledFirstTest).toBe(true);

    // reset
    calledFirstTest = false;

    render(template(test2), container);
    divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }

    expect(calledSecondTest).toBe(true);

    // reset
    calledSecondTest = false;

    render(null, container);
    divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }

    expect(calledFirstTest).toBe(false);
    expect(calledSecondTest).toBe(false);
    done();
  })