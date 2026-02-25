it('should populate the value attribute on select multiple using groups', () => {
  const template = (val) =>
    createElement(
      'select', {
        multiple: true,
        value: val,
      },
      createElement(
        'optgroup', {
          label: 'foo-group'
        },
        createElement('option', {
          value: 'foo'
        }),
      ),
      createElement(
        'optgroup', {
          label: 'bar-group',
          disabled: true
        },
        createElement('option', {
          value: 'bar'
        }),
      ),
    );

  render(template(undefined), container);

  const selectElement = container.firstChild;
  const fooOptGroup = selectElement.children[0];
  const barOptGroup = selectElement.children[1];
  const fooOption = fooOptGroup.children[0];
  const barOption = barOptGroup.children[0];

  // Assert static properties once, as they don't change between renders
  expect(fooOptGroup.disabled).toBe(false);
  expect(barOptGroup.disabled).toBe(true);
  expect(fooOptGroup.innerHTML).toBe('<option value="foo"></option>');
  expect(barOptGroup.innerHTML).toBe('<option value="bar"></option>');

  const testCases = [{
    value: ['foo', 'bar'],
    expected: {
      foo: true,
      bar: true
    }
  }, {
    value: [],
    expected: {
      foo: false,
      bar: false
    }
  }, {
    value: 'foo',
    expected: {
      foo: true,
      bar: false
    }
  }, {
    value: 'bar',
    expected: {
      foo: false,
      bar: true
    }
  }, {
    value: false,
    expected: {
      foo: false,
      bar: false
    }
  }, ];

  testCases.forEach(({
    value,
    expected
  }) => {
    render(template(value), container);
    expect(fooOption.selected).toBe(expected.foo);
    expect(barOption.selected).toBe(expected.bar);
  });
});