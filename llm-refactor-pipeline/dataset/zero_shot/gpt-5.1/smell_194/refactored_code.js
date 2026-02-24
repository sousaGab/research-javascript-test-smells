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

  const assertFlags = (firstExpected, secondExpected) => {
    expect(calledFirstTest).toBe(firstExpected);
    expect(calledSecondTest).toBe(secondExpected);
  };

  // first render with first handler
  render(template(test), container);
  clickAllDivs();
  assertFlags(true, false);

  // reset
  calledFirstTest = false;
  calledSecondTest = false;

  // second render with second handler
  render(template(test2), container);
  clickAllDivs();
  assertFlags(false, true);

  // reset
  calledFirstTest = false;
  calledSecondTest = false;

  // third render with no handler
  render(null, container);
  clickAllDivs();
  assertFlags(false, false);

  done();
});