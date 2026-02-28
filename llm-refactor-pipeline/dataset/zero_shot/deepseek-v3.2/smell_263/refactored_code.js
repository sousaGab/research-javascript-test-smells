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

  const testCases = [
    {
      value: ['foo', 'bar'],
      expected: {
        fooSelected: true,
        barSelected: true,
      },
    },
    {
      value: [],
      expected: {
        fooSelected: false,
        barSelected: false,
      },
    },
    {
      value: 'foo',
      expected: {
        fooSelected: true,
        barSelected: false,
      },
    },
    {
      value: 'bar',
      expected: {
        fooSelected: false,
        barSelected: true,
      },
    },
    {
      value: false,
      expected: {
        fooSelected: false,
        barSelected: false,
      },
    },
  ];

  testCases.forEach(({ value, expected }) => {
    render(template(value), container);

    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(
      expected.fooSelected,
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      expected.barSelected,
    );
  });
});