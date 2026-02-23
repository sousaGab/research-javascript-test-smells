it('should attach basic click events', (done) => {
  const template = (val) =>
    createElement('div', {
      id: 'test',
      onclick: val,
    });

  const called = {
    first: false,
    second: false,
  };

  function test() {
    called.first = true;
  }

  function test2() {
    called.second = true;
  }

  const clickAllDivs = () => {
    const divs = container.querySelectorAll('div');
    for (const div of divs) div.click();
  };

  const expectCalled = ({ first, second }) => {
    expect(called.first).toBe(first);
    expect(called.second).toBe(second);
  };

  const resetCalled = () => {
    called.first = false;
    called.second = false;
  };

  resetCalled();
  render(template(test), container);
  clickAllDivs();
  expectCalled({ first: true, second: false });

  resetCalled();
  render(template(test2), container);
  clickAllDivs();
  expectCalled({ first: false, second: true });

  resetCalled();
  render(null, container);
  clickAllDivs();
  expectCalled({ first: false, second: false });

  done();
});