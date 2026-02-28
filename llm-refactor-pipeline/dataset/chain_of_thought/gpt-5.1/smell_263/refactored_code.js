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

  const assertOptionsHtml = () => {
    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );
  };

  const assertSelection = (fooSelected, barSelected) => {
    expect(container.firstChild.children[0].children[0].selected).toEqual(
      fooSelected,
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      barSelected,
    );
  };

  const assertInitialGroupsState = () => {
    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);
  };

  const renderAndAssert = (value, fooSelected, barSelected, checkGroups = false) => {
    render(template(value), container);
    if (checkGroups) {
      assertInitialGroupsState();
    }
    assertOptionsHtml();
    assertSelection(fooSelected, barSelected);
  };

  renderAndAssert(['foo', 'bar'], true, true, true);
  renderAndAssert([], false, false);
  renderAndAssert('foo', true, false);
  renderAndAssert('bar', false, true);
  renderAndAssert(false, false, false);
});