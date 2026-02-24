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
        disabled: [false, true],
        innerHTML: ['<option value="foo"></option>', '<option value="bar"></option>'],
        selected: [true, true]
      }
    },
    {
      value: [],
      expected: {
        disabled: [false, true],
        innerHTML: ['<option value="foo"></option>', '<option value="bar"></option>'],
        selected: [false, false]
      }
    },
    {
      value: 'foo',
      expected: {
        disabled: [false, true],
        innerHTML: ['<option value="foo"></option>', '<option value="bar"></option>'],
        selected: [true, false]
      }
    },
    {
      value: 'bar',
      expected: {
        disabled: [false, true],
        innerHTML: ['<option value="foo"></option>', '<option value="bar"></option>'],
        selected: [false, true]
      }
    },
    {
      value: false,
      expected: {
        disabled: [false, true],
        innerHTML: ['<option value="foo"></option>', '<option value="bar"></option>'],
        selected: [false, false]
      }
    }
  ];

  testCases.forEach(({ value, expected }) => {
    render(template(value), container);

    expect(container.firstChild.children[0].disabled).toEqual(expected.disabled[0]);
    expect(container.firstChild.children[1].disabled).toEqual(expected.disabled[1]);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(expected.innerHTML[0]);
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(expected.innerHTML[1]);

    expect(container.firstChild.children[0].children[0].selected).toEqual(expected.selected[0]);
    expect(container.firstChild.children[1].children[0].selected).toEqual(expected.selected[1]);
  });
});