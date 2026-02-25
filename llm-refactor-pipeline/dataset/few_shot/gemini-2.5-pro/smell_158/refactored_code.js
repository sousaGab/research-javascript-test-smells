describe('event options parsing', () => {
  if (HAS_PASSIVE_EVENT_SUPPORT) {
    describe('with passive event support', () => {
      it('converts boolean to object', () => {
        expect(parseEventOptions(true)).toEqual({
          capture: true
        });
        expect(parseEventOptions(false)).toEqual({
          capture: false
        });
        expect(parseEventOptions()).toEqual({
          capture: false
        });
      });

      it('parses object correctly by returning it as-is', () => {
        expect(parseEventOptions({
          capture: false
        })).toEqual({
          capture: false
        });
        expect(parseEventOptions({
          capture: true
        })).toEqual({
          capture: true
        });
        expect(parseEventOptions({})).toEqual({});
        expect(parseEventOptions({
          capture: false,
          foobar: true
        })).toEqual({
          capture: false,
          foobar: true
        });
        expect(parseEventOptions({
          capture: true,
          foobar: false
        })).toEqual({
          capture: true,
          foobar: false
        });
      });
    });
  } else {
    describe('without passive event support', () => {
      it('converts non-object to boolean', () => {
        expect(parseEventOptions(true)).toBe(true);
        expect(parseEventOptions(false)).toBe(false);
        expect(parseEventOptions()).toBe(false);
        expect(parseEventOptions(null)).toBe(false);
      });

      it('converts object to boolean based on capture property', () => {
        expect(parseEventOptions({
          capture: false
        })).toBe(false);
        expect(parseEventOptions({
          capture: true
        })).toBe(true);
        expect(parseEventOptions({})).toBe(false);
        expect(parseEventOptions({
          capture: false,
          foobar: true
        })).toBe(false);
        expect(parseEventOptions({
          capture: true,
          foobar: true
        })).toBe(true);
        expect(parseEventOptions({
          foobar: true
        })).toBe(false);
        expect(parseEventOptions({
          foobar: false
        })).toBe(false);
      });
    });
  }
});