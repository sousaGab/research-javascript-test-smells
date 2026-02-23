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

  const getSelect = () => container.firstChild;
  const getGroups = () => Array.from(getSelect().children);
  const getGroup = (index) => getGroups()[index];
  const getOption = (groupIndex, optionIndex = 0) =>
    getGroup(groupIndex).children[optionIndex];

  const expectGroupsDisabledState = (fooDisabled, barDisabled) => {
    expect(getGroup(0).disabled).toEqual(fooDisabled);
    expect(getGroup(1).disabled).toEqual(barDisabled);
  };

  const expectGroupsInnerHTML = () => {
    expect(getSelect().childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(getSelect().childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );
  };

  const expectSelectedState = (fooSelected, barSelected) => {
    expect(getOption(0).selected).toEqual(fooSelected);
    expect(getOption(1).selected).toEqual(barSelected);
  };

  const renderAndAssert = (value, fooSelected, barSelected) => {
    render(template(value), container);
    expectGroupsInnerHTML();
    expectSelectedState(fooSelected, barSelected);
  };

  render(template(['foo', 'bar']), container);

  expectGroupsDisabledState(false, true);
  expectGroupsInnerHTML();
  expectSelectedState(true, true);

  renderAndAssert([], false, false);
  renderAndAssert('foo', true, false);
  renderAndAssert('bar', false, true);
  renderAndAssert(false, false, false);
});