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

  const expectCommonStructure = () => {
    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );
  };

  const expectSelection = (fooSelected, barSelected) => {
    expect(container.firstChild.children[0].children[0].selected).toEqual(
      fooSelected,
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      barSelected,
    );
  };

  const scenarios = [
    { value: ['foo', 'bar'], fooSelected: true, barSelected: true },
    { value: [], fooSelected: false, barSelected: false },
    { value: 'foo', fooSelected: true, barSelected: false },
    { value: 'bar', fooSelected: false, barSelected: true },
    { value: false, fooSelected: false, barSelected: false },
  ];

  scenarios.forEach(({ value, fooSelected, barSelected }) => {
    render(template(value), container);
    expectCommonStructure();
    expectSelection(fooSelected, barSelected);
  });
});