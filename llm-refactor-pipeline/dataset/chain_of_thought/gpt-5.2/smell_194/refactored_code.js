it('should attach basic click events', (done) => {
  const template = (val) =>
    createElement('div', {
      id: 'test',
      onclick: val,
    });

  const clickAllDivs = () => {
    const divs = container.querySelectorAll('div');
    for (const div of divs) {
      div.click();
    }
  };

  let calledFirstTest = false;
  function test() {
    calledFirstTest = true;
  }

  let calledSecondTest = false;
  function test2() {
    calledSecondTest = true;
  }

  render(template(test), container);
  clickAllDivs();
  expect(calledFirstTest).toBe(true);

  calledFirstTest = false;

  render(template(test2), container);
  clickAllDivs();
  expect(calledSecondTest).toBe(true);

  calledFirstTest = false;
  calledSecondTest = false;

  render(null, container);
  clickAllDivs();
  expect(calledSecondTest).toBe(false);

  done();
});