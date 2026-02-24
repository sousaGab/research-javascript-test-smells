it('should attach basic click events', (done) => {
  const template = (val) =>
    createElement('div', {
      id: 'test',
      onclick: val,
    });

  let calledFirstTest = false;
  let calledSecondTest = false;

  function test() {
    calledFirstTest = true;
  }

  function test2() {
    calledSecondTest = true;
  }

  const clickAllDivs = () => {
    const divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }
  };

  const expectCalls = (firstExpected, secondExpected) => {
    expect(calledFirstTest).toBe(firstExpected);
    expect(calledSecondTest).toBe(secondExpected);
  };

  render(template(test), container);
  clickAllDivs();
  expectCalls(true, false);

  calledFirstTest = false;
  calledSecondTest = false;

  render(template(test2), container);
  clickAllDivs();
  expectCalls(false, true);

  calledFirstTest = false;
  calledSecondTest = false;

  render(null, container);
  clickAllDivs();
  expectCalls(false, false);

  done();
});