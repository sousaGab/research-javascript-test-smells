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

  const getOptionElements = () => ({
    fooGroup: container.firstChild.children[0],
    barGroup: container.firstChild.children[1],
    fooOption: container.firstChild.children[0].children[0],
    barOption: container.firstChild.children[1].children[0],
  });

  const assertOptionState = (expectedValues) => {
    const { fooOption, barOption } = getOptionElements();
    
    expect(fooOption.selected).toEqual(expectedValues.foo);
    expect(barOption.selected).toEqual(expectedValues.bar);
  };

  const assertOptionHtml = () => {
    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option>');
  };

  render(template(['foo', 'bar']), container);
  assertOptionHtml();
  expect(getOptionElements().fooGroup.disabled).toEqual(false);
  expect(getOptionElements().barGroup.disabled).toEqual(true);
  assertOptionState({ foo: true, bar: true });

  render(template([]), container);
  assertOptionHtml();
  assertOptionState({ foo: false, bar: false });

  render(template('foo'), container);
  assertOptionHtml();
  assertOptionState({ foo: true, bar: false });

  render(template('bar'), container);
  assertOptionHtml();
  assertOptionState({ foo: false, bar: true });

  render(template(false), container);
  assertOptionHtml();
  assertOptionState({ foo: false, bar: false });
});