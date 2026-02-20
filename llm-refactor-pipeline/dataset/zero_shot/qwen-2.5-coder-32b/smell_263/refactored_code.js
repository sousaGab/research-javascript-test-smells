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

    const getOption = (index) => container.firstChild.childNodes[index];
    const getOptgroup = (index) => container.firstChild.children[index];

    render(template(['foo', 'bar']), container);

    expect(getOptgroup(0).disabled).toBe(false);
    expect(getOptgroup(1).disabled).toBe(true);

    expect(getOption(0).innerHTML).toBe('<option value="foo"></option>');
    expect(getOption(1).innerHTML).toBe('<option value="bar"></option>');

    expect(getOptgroup(0).children[0].selected).toBe(true);
    expect(getOptgroup(1).children[0].selected).toBe(true);

    render(template([]), container);

    expect(getOption(0).innerHTML).toBe('<option value="foo"></option>');
    expect(getOption(1).innerHTML).toBe('<option value="bar"></option>');

    expect(getOptgroup(0).children[0].selected).toBe(false);
    expect(getOptgroup(1).children[0].selected).toBe(false);

    render(template('foo'), container);

    expect(getOption(0).innerHTML).toBe('<option value="foo"></option>');
    expect(getOption(1).innerHTML).toBe('<option value="bar"></option>');

    expect(getOptgroup(0).children[0].selected).toBe(true);
    expect(getOptgroup(1).children[0].selected).toBe(false);

    render(template('bar'), container);

    expect(getOption(0).innerHTML).toBe('<option value="foo"></option>');
    expect(getOption(1).innerHTML).toBe('<option value="bar"></option>');

    expect(getOptgroup(0).children[0].selected).toBe(false);
    expect(getOptgroup(1).children[0].selected).toBe(true);

    render(template(false), container);

    expect(getOption(0).innerHTML).toBe('<option value="foo"></option>');
    expect(getOption(1).innerHTML).toBe('<option value="bar"></option>');

    expect(getOptgroup(0).children[0].selected).toBe(false);
    expect(getOptgroup(1).children[0].selected).toBe(false);
  })