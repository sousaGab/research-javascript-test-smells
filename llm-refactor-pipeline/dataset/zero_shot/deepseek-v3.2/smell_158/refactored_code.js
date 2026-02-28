it('event options parsing works', () => {
  const testCases = HAS_PASSIVE_EVENT_SUPPORT ? [
    { input: true, expected: { capture: true } },
    { input: false, expected: { capture: false } },
    { input: undefined, expected: { capture: false } },
    { input: { capture: false }, expected: { capture: false } },
    { input: { capture: true }, expected: { capture: true } },
    { input: {}, expected: {} },
    { input: { capture: false, foobar: true }, expected: { capture: false, foobar: true } },
    { input: { capture: true, foobar: false }, expected: { capture: true, foobar: false } }
  ] : [
    { input: true, expected: true },
    { input: false, expected: false },
    { input: undefined, expected: false },
    { input: null, expected: false },
    { input: { capture: false }, expected: false },
    { input: { capture: true }, expected: true },
    { input: {}, expected: false },
    { input: { capture: false, foobar: true }, expected: false },
    { input: { capture: true, foobar: true }, expected: true },
    { input: { foobar: true }, expected: false },
    { input: { foobar: false }, expected: false }
  ];

  testCases.forEach(({ input, expected }) => {
    expect(parseEventOptions(input)).toEqual(expected);
  });
});