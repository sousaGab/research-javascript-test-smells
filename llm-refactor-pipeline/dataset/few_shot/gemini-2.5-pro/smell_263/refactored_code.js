it('should populate the value attribute on select multiple using groups', () => {
  const template = (val) =>
    createElement(
      'select', {
        multiple: true,
        value: val,
      },
      createElement(
        'optgroup', {
          label: 'foo-group'
        },
        createElement('option', {
          value: 'foo'
        }),
      ),
      createElement(
        'optgroup', {
          label: 'bar-group',
          disabled: true
        },
        createElement('option', {
          value: 'bar'
        }),
      ),
    );

  render(template(undefined), container);

  const select = container.firstChild;
  const [optgroupFoo, optgroupBar] = select.children;
  const [optionFoo] = optgroupFoo.children;
  const [optionBar] = optgroupBar.children;

  expect(optgroupFoo.disabled).toBe(false);
  expect(optgroupBar.disabled).toBe(true);
  expect(optgroupFoo.innerHTML).toBe('<option value="foo"></option>');
  expect(optgroupBar.innerHTML).toBe('<option value="bar"></option>');

  const testCases = [{
    value: ['foo', 'bar'],
    expected: [true, true]
  }, {
    value: [],
    expected: [false, false]
  }, {
    value: 'foo',
    expected: [true, false]
  }, {
    value: 'bar',
    expected: [false, true]
  }, {
    value: false,
    expected: [false, false]
  }, ];

  testCases.forEach(({
    value,
    expected
  }) => {
    render(template(value), container);
    const [fooSelected, barSelected] = expected;
    expect(optionFoo.selected).toBe(fooSelected);
    expect(optionBar.selected).toBe(barSelected);
  });
});