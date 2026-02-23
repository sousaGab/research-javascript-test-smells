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

    const fooInnerHTML = '<option value="foo"></option>';
    const barInnerHTML = '<option value="bar"></option>';

    const assertInnerHTML = () => {
      expect(container.firstChild.childNodes[0].innerHTML).toEqual(fooInnerHTML);
      expect(container.firstChild.childNodes[1].innerHTML).toEqual(barInnerHTML);
    };

    const assertSelected = (fooSelected, barSelected) => {
      expect(container.firstChild.children[0].children[0].selected).toEqual(fooSelected);
      expect(container.firstChild.children[1].children[0].selected).toEqual(barSelected);
    };

    render(template(['foo', 'bar']), container);

    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);
    assertInnerHTML();
    assertSelected(true, true);

    render(template([]), container);
    assertInnerHTML();
    assertSelected(false, false);

    render(template('foo'), container);
    assertInnerHTML();
    assertSelected(true, false);

    render(template('bar'), container);
    assertInnerHTML();
    assertSelected(false, true);

    render(template(false), container);
    assertInnerHTML();
    assertSelected(false, false);
  })