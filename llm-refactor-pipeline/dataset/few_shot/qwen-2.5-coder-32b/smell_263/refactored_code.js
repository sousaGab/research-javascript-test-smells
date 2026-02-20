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

    const getOptionElements = () => container.firstChild.children;
    const getOptionInnerHTML = (index) => container.firstChild.childNodes[index].innerHTML;
    const isOptionSelected = (groupIndex, optionIndex) => container.firstChild.children[groupIndex].children[optionIndex].selected;

    // Test initial state with multiple values
    render(template(['foo', 'bar']), container);
    expect(getOptionElements()[0].disabled).toBe(false);
    expect(getOptionElements()[1].disabled).toBe(true);
    expect(getOptionInnerHTML(0)).toBe('<option value="foo"></option>');
    expect(getOptionInnerHTML(1)).toBe('<option value="bar"></option>');
    expect(isOptionSelected(0, 0)).toBe(true);
    expect(isOptionSelected(1, 0)).toBe(true);

    // Test empty values
    render(template([]), container);
    expect(getOptionInnerHTML(0)).toBe('<option value="foo"></option>');
    expect(getOptionInnerHTML(1)).toBe('<option value="bar"></option>');
    expect(isOptionSelected(0, 0)).toBe(false);
    expect(isOptionSelected(1, 0)).toBe(false);

    // Test single value 'foo'
    render(template('foo'), container);
    expect(getOptionInnerHTML(0)).toBe('<option value="foo"></option>');
    expect(getOptionInnerHTML(1)).toBe('<option value="bar"></option>');
    expect(isOptionSelected(0, 0)).toBe(true);
    expect(isOptionSelected(1, 0)).toBe(false);

    // Test single value 'bar'
    render(template('bar'), container);
    expect(getOptionInnerHTML(0)).toBe('<option value="foo"></option>');
    expect(getOptionInnerHTML(1)).toBe('<option value="bar"></option>');
    expect(isOptionSelected(0, 0)).toBe(false);
    expect(isOptionSelected(1, 0)).toBe(true);

    // Test falsy value
    render(template(false), container);
    expect(getOptionInnerHTML(0)).toBe('<option value="foo"></option>');
    expect(getOptionInnerHTML(1)).toBe('<option value="bar"></option>');
    expect(isOptionSelected(0, 0)).toBe(false);
    expect(isOptionSelected(1, 0)).toBe(false);
  })