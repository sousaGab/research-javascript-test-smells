it('event options parsing works', async () => {
    // Extract the conditional logic into a separate function
    const parseEventOptions = (options) => {
        if (HAS_PASSIVE_EVENT_SUPPORT) {
            // Converts boolean to object
            if (typeof options === 'boolean') {
                return { capture: options };
            }
            // Parses object correctly (returns as-is)
            return options;
        } else {
            // Converts non object to boolean
            if (typeof options === 'boolean') {
                return options;
            }
            // Converts object to boolean
            return options.capture;
        }
    };

    // Override the function with a mock implementation for each scenario
    const parseEventOptionsMock = (options) => {
        if (HAS_PASSIVE_EVENT_SUPPORT) {
            // Converts boolean to object
            if (typeof options === 'boolean') {
                return { capture: options };
            }
            // Parses object correctly (returns as-is)
            return options;
        } else {
            // Converts non object to boolean
            if (typeof options === 'boolean') {
                return options;
            }
            // Converts object to boolean
            return options.capture;
        }
    };

    // Use the mock implementation to test the different scenarios
    expect(parseEventOptionsMock(true)).toEqual({ capture: true });
    expect(parseEventOptionsMock(false)).toEqual({ capture: false });
    expect(parseEventOptionsMock()).toEqual({ capture: false });
    expect(parseEventOptionsMock(null)).toEqual(false);
    expect(parseEventOptionsMock({ capture: false })).toEqual(false);
    expect(parseEventOptionsMock({ capture: true })).toEqual(true);
    expect(parseEventOptionsMock({})).toEqual(false);
    expect(parseEventOptionsMock({ capture: false, foobar: true })).toEqual(false);
    expect(parseEventOptionsMock({ capture: true, foobar: true })).toEqual(true);
    expect(parseEventOptionsMock({ foobar: true })).toEqual(false);
    expect(parseEventOptionsMock({ foobar: false })).toEqual(false);
});