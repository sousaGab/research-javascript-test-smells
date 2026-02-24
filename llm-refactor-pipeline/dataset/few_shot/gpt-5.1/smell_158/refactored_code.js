it('event options parsing works when passive event is supported', async () => {
  if (!HAS_PASSIVE_EVENT_SUPPORT) {
    return pending('Passive event support is not available in this environment');
  }

  // Converts boolean to object
  expect(parseEventOptions(true)).toEqual({ capture: true });
  expect(parseEventOptions(false)).toEqual({ capture: false });
  expect(parseEventOptions()).toEqual({ capture: false });

  // Parses object correctly (returns as-is)
  expect(parseEventOptions({ capture: false })).toEqual({ capture: false });
  expect(parseEventOptions({ capture: true })).toEqual({ capture: true });
  expect(parseEventOptions({})).toEqual({});
  expect(parseEventOptions({ capture: false, foobar: true })).toEqual({
    capture: false,
    foobar: true
  });
  expect(parseEventOptions({ capture: true, foobar: false })).toEqual({
    capture: true,
    foobar: false
  });
});

it('event options parsing works when passive event is not supported', async () => {
  if (HAS_PASSIVE_EVENT_SUPPORT) {
    return pending('Passive event support is available in this environment');
  }

  // Converts non object to boolean
  expect(parseEventOptions(true)).toEqual(true);
  expect(parseEventOptions(false)).toEqual(false);
  expect(parseEventOptions()).toEqual(false);
  expect(parseEventOptions(null)).toEqual(false);
  // Converts object to boolean
  expect(parseEventOptions({ capture: false })).toEqual(false);
  expect(parseEventOptions({ capture: true })).toEqual(true);
  expect(parseEventOptions({})).toEqual(false);
  expect(parseEventOptions({ capture: false, foobar: true })).toEqual(false);
  expect(parseEventOptions({ capture: true, foobar: true })).toEqual(true);
  expect(parseEventOptions({ foobar: true })).toEqual(false);
  expect(parseEventOptions({ foobar: false })).toEqual(false);
});