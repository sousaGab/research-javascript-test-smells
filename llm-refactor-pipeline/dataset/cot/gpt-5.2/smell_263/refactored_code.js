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

  const getSelect = () => container.firstChild;
  const getGroups = () => Array.from(getSelect().children);
  const getGroup = (index) => getGroups()[index];
  const getOption = (groupIndex) => getGroup(groupIndex).children[0];

  const expectGroupsDisabledState = (states) => {
    states.forEach((disabled, i) => {
      expect(getGroup(i).disabled).toEqual(disabled);
    });
  };

  const expectOptionsInnerHTML = (htmlByGroupIndex) => {
    htmlByGroupIndex.forEach((html, i) => {
      expect(getSelect().childNodes[i].innerHTML).toEqual(html);
    });
  };

  const expectOptionsSelectedState = (states) => {
    states.forEach((selected, i) => {
      expect(getOption(i).selected).toEqual(selected);
    });
  };

  const EXPECTED_OPTIONS_HTML = [
    '<option value="foo"></option>',
    '<option value="bar"></option>',
  ];

  render(template(['foo', 'bar']), container);

  expectGroupsDisabledState([false, true]);
  expectOptionsInnerHTML(EXPECTED_OPTIONS_HTML);
  expectOptionsSelectedState([true, true]);

  render(template([]), container);

  expectOptionsInnerHTML(EXPECTED_OPTIONS_HTML);
  expectOptionsSelectedState([false, false]);

  render(template('foo'), container);

  expectOptionsInnerHTML(EXPECTED_OPTIONS_HTML);
  expectOptionsSelectedState([true, false]);

  render(template('bar'), container);

  expectOptionsInnerHTML(EXPECTED_OPTIONS_HTML);
  expectOptionsSelectedState([false, true]);

  render(template(false), container);

  expectOptionsInnerHTML(EXPECTED_OPTIONS_HTML);
  expectOptionsSelectedState([false, false]);
});