// Your COMPLETE refactored test code here

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

    // render(template(undefined), container);
    render(template(['foo', 'bar']), container);

    expect(container.firstChild.children[0].disabled).toEqual(false);
    expect(container.firstChild.children[1].disabled).toEqual(true);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].children[0].selected).toEqual(true);

    render(template([]), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(
      false,
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      false,
    );

    render(template('foo'), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(true);
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      false,
    );

    render(template('bar'), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(
      false,
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(true);

    render(template(false), container);

    expect(container.firstChild.childNodes[0].innerHTML).toEqual(
      '<option value="foo"></option>',
    );
    expect(container.firstChild.childNodes[1].innerHTML).toEqual(
      '<option value="bar"></option>',
    );

    expect(container.firstChild.children[0].children[0].selected).toEqual(
      false,
    );
    expect(container.firstChild.children[1].children[0].selected).toEqual(
      false,
    );
  })