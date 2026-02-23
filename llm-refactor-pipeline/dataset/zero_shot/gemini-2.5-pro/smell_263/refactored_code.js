it('should populate the value attribute on select multiple using groups', () => {
  const template = (val) =>
    createElement(
      'select', {
        multiple: true,
        value: val
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
  const [optgroup1, optgroup2] = select.children;
  const [option1] = optgroup1.children;
  const [option2] = optgroup2.children;

  expect(optgroup1.disabled).toBe(false);
  expect(optgroup2.disabled).toBe(true);
  expect(optgroup1.innerHTML).toBe('<option value="foo"></option>');
  expect(optgroup2.innerHTML).toBe('<option value="bar"></option>');

  const assertSelection = (value, expectedFoo, expectedBar) => {
    render(template(value), container);
    expect(option1.selected).toBe(expectedFoo);
    expect(option2.selected).toBe(expectedBar);
  };

  assertSelection(['foo', 'bar'], true, true);
  assertSelection([], false, false);
  assertSelection('foo', true, false);
  assertSelection('bar', false, true);
  assertSelection(false, false, false);
});