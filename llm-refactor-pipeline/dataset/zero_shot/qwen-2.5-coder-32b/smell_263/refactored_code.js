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

    const select = container.firstChild;
    const group1 = select.children[0];
    const group2 = select.children[1];
    const option1 = group1.children[0];
    const option2 = group2.children[0];

    render(template(['foo', 'bar']), container);

    expect(group1.disabled).toBe(false);
    expect(group2.disabled).toBe(true);
    expect(group1.innerHTML).toBe('<option value="foo"></option>');
    expect(group2.innerHTML).toBe('<option value="bar"></option>');
    expect(option1.selected).toBe(true);
    expect(option2.selected).toBe(true);

    render(template([]), container);

    expect(group1.innerHTML).toBe('<option value="foo"></option>');
    expect(group2.innerHTML).toBe('<option value="bar"></option>');
    expect(option1.selected).toBe(false);
    expect(option2.selected).toBe(false);

    render(template('foo'), container);

    expect(group1.innerHTML).toBe('<option value="foo"></option>');
    expect(group2.innerHTML).toBe('<option value="bar"></option>');
    expect(option1.selected).toBe(true);
    expect(option2.selected).toBe(false);

    render(template('bar'), container);

    expect(group1.innerHTML).toBe('<option value="foo"></option>');
    expect(group2.innerHTML).toBe('<option value="bar"></option>');
    expect(option1.selected).toBe(false);
    expect(option2.selected).toBe(true);

    render(template(false), container);

    expect(group1.innerHTML).toBe('<option value="foo"></option>');
    expect(group2.innerHTML).toBe('<option value="bar"></option>');
    expect(option1.selected).toBe(false);
    expect(option2.selected).toBe(false);
  })