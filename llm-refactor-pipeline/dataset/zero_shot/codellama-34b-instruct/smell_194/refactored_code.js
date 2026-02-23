// Your COMPLETE refactored test code here

it('should attach basic click events', (done) => {
    const template = (val) =>
      createElement('div', {
        id: 'test',
        onclick: val,
      });

    let calledTest = false;

    function test() {
      calledTest = true;
    }

    render(template(test), container);

    let divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }
    expect(calledTest).toBe(true);

    // reset
    calledTest = false;

    render(null, container);
    divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }

    expect(calledTest).toBe(false);
    done();
  })