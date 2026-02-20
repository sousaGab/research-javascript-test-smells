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

    let calledSecondTest = false;

    function test2() {
      calledSecondTest = true;
    }

    // Test first event handler
    render(template(test), container);
    let divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }
    expect(calledFirstTest).toBe(true);

    // Test second event handler
    calledFirstTest = false;
    render(template(test2), container);
    divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }
    expect(calledSecondTest).toBe(true);

    // Test no event handler
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