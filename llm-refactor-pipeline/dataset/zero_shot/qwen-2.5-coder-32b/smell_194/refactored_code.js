it('should attach basic click events', (done) => {
  const template = (val) =>
    createElement('div', {
      id: 'test',
      onclick: val,
    });

  // Test 1: First event handler
  let calledFirstTest = false;
  function test() {
    calledFirstTest = true;
  }

  render(template(test), container);
  let divs = container.querySelectorAll('div');
  for (const div of divs) {
    div.click();
  }
  expect(calledFirstTest).toBe(true);

  // Test 2: Second event handler
  let calledSecondTest = false;
  function test2() {
    calledSecondTest = true;
  }

  // reset
  calledFirstTest = false;

  render(template(test2), container);
  divs = container.querySelectorAll('div');
  for (const div of divs) {
    div.click();
  }

  expect(calledFirstTest).toBe(false);
  expect(calledSecondTest).toBe(true);

  // Test 3: No event handler
  // reset
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