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

  const getOptionElements = () => [
    container.firstChild.children[0].children[0],
    container.firstChild.children[1].children[0],
  ];

  const getOptionInnerHTML = () => [
    container.firstChild.childNodes[0].innerHTML,
    container.firstChild.childNodes[1].innerHTML,
  ];

  const testScenario = (value, expectedSelected, expectedDisabled) => {
    render(template(value), container);
    
    expect(getOptionInnerHTML()).toEqual([
      '<option value="foo"></option>',
      '<option value="bar"></option>',
    ]);
    
    expect(container.firstChild.children[0].disabled).toEqual(expectedDisabled[0]);
    expect(container.firstChild.children[1].disabled).toEqual(expectedDisabled[1]);
    
    const optionElements = getOptionElements();
    optionElements.forEach((option, index) => {
      expect(option.selected).toEqual(expectedSelected[index]);
    });
  };

  testScenario(['foo', 'bar'], [true, true], [false, true]);
  testScenario([], [false, false], [false, true]);
  testScenario('foo', [true, false], [false, true]);
  testScenario('bar', [false, true], [false, true]);
  testScenario(false, [false, false], [false, true]);
});