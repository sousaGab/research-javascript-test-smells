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

    render(template(undefined), container);

    const selectElement = container.firstChild;
    const [fooOptGroup, barOptGroup] = selectElement.children;
    const fooOption = fooOptGroup.firstChild;
    const barOption = barOptGroup.firstChild;

    // Assert static properties once
    expect(fooOptGroup.disabled).toBe(false);
    expect(barOptGroup.disabled).toBe(true);
    expect(fooOptGroup.innerHTML).toBe('<option value="foo"></option>');
    expect(barOptGroup.innerHTML).toBe('<option value="bar"></option>');

    // Use a parameterized approach for dynamic assertions
    const testCases = [
      { value: ['foo', 'bar'], expected: [true, true] },
      { value: [], expected: [false, false] },
      { value: 'foo', expected: [true, false] },
      { value: 'bar', expected: [false, true] },
      { value: false, expected: [false, false] },
    ];

    testCases.forEach(({ value, expected }) => {
      render(template(value), container);
      const [expectedFooSelected, expectedBarSelected] = expected;
      
      expect(fooOption.selected).toBe(expectedFooSelected);
      expect(barOption.selected).toBe(expectedBarSelected);
    });
  })