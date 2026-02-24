it('should populate and update the value attribute on select multiple using groups', () => {
  const template = (val) =>
    createElement(
      'select',
      {
        multiple: true,
        value: val,
      },
      createElement(
        'optgroup',
        { label: 'foo-group' },
        createElement('option', { value: 'foo' }),
      ),
      createElement(
        'optgroup',
        { label: 'bar-group', disabled: true },
        createElement('option', { value: 'bar' }),
      ),
    );

  // Initial render to set up the DOM and element references
  render(template(['foo', 'bar']), container);

  const selectElement = container.firstChild;
  const [fooGroup, barGroup] = selectElement.children;
  const fooOption = fooGroup.children[0];
  const barOption = barGroup.children[0];

  const assertSelection = (fooSelected, barSelected) => {
    expect(fooOption.selected).toBe(fooSelected);
    expect(barOption.selected).toBe(barSelected);
  };

  // Verify initial structure and attributes once
  expect(fooGroup.disabled).toBe(false);
  expect(barGroup.disabled).toBe(true);
  expect(fooGroup.innerHTML).toBe('<option value="foo"></option>');
  expect(barGroup.innerHTML).toBe('<option value="bar"></option>');

  // Test case 1: Initial render with both values selected
  assertSelection(true, true);

  // Test case 2: Update to select no values
  render(template([]), container);
  assertSelection(false, false);

  // Test case 3: Update to select 'foo'
  render(template('foo'), container);
  assertSelection(true, false);

  // Test case 4: Update to select 'bar'
  render(template('bar'), container);
  assertSelection(false, true);

  // Test case 5: Update with a falsy value to select no values
  render(template(false), container);
  assertSelection(false, false);
});