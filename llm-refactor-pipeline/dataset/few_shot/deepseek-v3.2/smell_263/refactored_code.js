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

  const verifyStructure = () => {
    expect(container.firstChild.childNodes[0].innerHTML).toEqual('<option value="foo"></option>');
    expect(container.firstChild.childNodes[1].innerHTML).toEqual('<option value="bar"></option>');
  };

  const verifyDisabledStates = () => {
    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);
  };

  const verifySelectedStates = (fooSelected, barSelected) => {
    expect(container.firstChild.children[0].children[0].selected).toEqual(fooSelected);
    expect(container.firstChild.children[1].children[0].selected).toEqual(barSelected);
  };

  render(template(['foo', 'bar']), container);
  verifyDisabledStates();
  verifyStructure();
  verifySelectedStates(true, true);

  render(template([]), container);
  verifyStructure();
  verifySelectedStates(false, false);

  render(template('foo'), container);
  verifyStructure();
  verifySelectedStates(true, false);

  render(template('bar'), container);
  verifyStructure();
  verifySelectedStates(false, true);

  render(template(false), container);
  verifyStructure();
  verifySelectedStates(false, false);
});