describe('event options parsing', () => {
  if (HAS_PASSIVE_EVENT_SUPPORT) {
    it('parses options as an object when passive events are supported', () => {
      // JSDOM probably does not support passive mode
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
  } else {
    it('parses options as a boolean when passive events are not supported', () => {
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
  }
});