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

  const expectOptGroupsDisabledState = (fooDisabled, barDisabled) => {
    expect(container.firstChild.children[0].disabled).toEqual(fooDisabled);
    expect(container.firstChild.children[1].disabled).toEqual(barDisabled);
  };

  const expectOptionsMarkupUnchanged = () => {
    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );
  };

  const expectSelectedState = (fooSelected, barSelected) => {
    expect(container.firstChild.children[0].children[0].selected).toEqual(
      fooSelected,
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      barSelected,
    );
  };

  render(template(['foo', 'bar']), container);

  expectOptGroupsDisabledState(false, true);
  expectOptionsMarkupUnchanged();
  expectSelectedState(true, true);

  render(template([]), container);

  expectOptionsMarkupUnchanged();
  expectSelectedState(false, false);

  render(template('foo'), container);

  expectOptionsMarkupUnchanged();
  expectSelectedState(true, false);

  render(template('bar'), container);

  expectOptionsMarkupUnchanged();
  expectSelectedState(false, true);

  render(template(false), container);

  expectOptionsMarkupUnchanged();
  expectSelectedState(false, false);
});