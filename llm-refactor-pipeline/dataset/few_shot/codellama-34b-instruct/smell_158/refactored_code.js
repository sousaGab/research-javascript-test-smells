it('event options parsing works', async () => {
  const parseEventOptions = (options) => {
    if (typeof options === 'boolean') {
      return { capture: options };
    } else if (typeof options === 'object') {
      return options;
    } else {
      return false;
    }
  };

  expect(parseEventOptions(true)).toEqual({ capture: true });
  expect(parseEventOptions(false)).toEqual({ capture: false });
  expect(parseEventOptions()).toEqual({ capture: false });
  expect(parseEventOptions(null)).toEqual({ capture: false });
  expect(parseEventOptions({ capture: false })).toEqual({ capture: false });
  expect(parseEventOptions({ capture: true })).toEqual({ capture: true });
  expect(parseEventOptions({})).toEqual({});
  expect(parseEventOptions({ capture: false, foobar: true })).toEqual({
    capture: false,
    foobar: true,
  });
  expect(parseEventOptions({ capture: true, foobar: false })).toEqual({
    capture: true,
    foobar: false,
  });
  expect(parseEventOptions({ foobar: true })).toEqual({ foobar: true });
  expect(parseEventOptions({ foobar: false })).toEqual({ foobar: false });
});