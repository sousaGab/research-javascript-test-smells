it('should populate the value attribute on select multiple using groups', () => {
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

  const selectElement = container.firstChild;
  const fooOptgroup = selectElement.children[0];
  const barOptgroup = selectElement.children[1];
  const fooOption = fooOptgroup.children[0];
  const barOption = barOptgroup.children[0];

  render(template(['foo', 'bar']), container);
  expect(fooOptgroup.disabled).toBe(false);
  expect(barOptgroup.disabled).toBe(true);
  expect(fooOption.selected).toBe(true);
  expect(barOption.selected).toBe(true);

  render(template([]), container);
  expect(fooOption.selected).toBe(false);
  expect(barOption.selected).toBe(false);

  render(template('foo'), container);
  expect(fooOption.selected).toBe(true);
  expect(barOption.selected).toBe(false);

  render(template('bar'), container);
  expect(fooOption.selected).toBe(false);
  expect(barOption.selected).toBe(true);

  render(template(false), container);
  expect(fooOption.selected).toBe(false);
  expect(barOption.selected).toBe(false);
});