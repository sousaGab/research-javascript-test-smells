function parseEventOptions(options) {
  if (HAS_PASSIVE_EVENT_SUPPORT) {
    return { capture: options.capture };
  } else {
    return options.capture;
  }
}

it('event options parsing works', async () => {
  expect(parseEventOptions(true)).toEqual({ capture: true });
  expect(parseEventOptions(false)).toEqual({ capture: false });
  expect(parseEventOptions()).toEqual({ capture: false });
  expect(parseEventOptions(null)).toEqual({ capture: false });
  expect(parseEventOptions({ capture: false })).toEqual(false);
  expect(parseEventOptions({ capture: true })).toEqual(true);
  expect(parseEventOptions({})).toEqual(false);
  expect(parseEventOptions({ capture: false, foobar: true })).toEqual(false);
  expect(parseEventOptions({ capture: true, foobar: true })).toEqual(true);
  expect(parseEventOptions({ foobar: true })).toEqual(false);
  expect(parseEventOptions({ foobar: false })).toEqual(false);
});