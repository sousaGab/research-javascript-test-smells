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

  // First render with test handler
  render(template(test), container);
  let divs = container.querySelectorAll('div');
  for (const div of divs) {
    div.click();
  }
  expect(calledFirstTest).toBe(true);

  // Reset and render with test2 handler
  calledFirstTest = false;
  render(template(test2), container);
  divs = container.querySelectorAll('div');
  for (const div of divs) {
    div.click();
  }
  expect(calledFirstTest).toBe(false);
  expect(calledSecondTest).toBe(true);

  // Reset and render null
  calledFirstTest = false;
  calledSecondTest = false;
  render(null, container);
  divs = container.querySelectorAll('div');
  for (const div of divs) {
    div.click();
  }
  expect(calledFirstTest).toBe(false);
  expect(calledSecondTest).toBe(false);
  
  done();
});