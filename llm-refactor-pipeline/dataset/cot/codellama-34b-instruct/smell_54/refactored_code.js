test("Resets internal status", () => {
    const img = document.createElement("img");
    const settings = {
        src: url200,
        alt: "Test image",
        width: 100,
        height: 100
    };
    const instance = {
        cancel: jest.fn()
    };
    const entry = {
        target: img,
        settings: settings,
        instance: instance
    };

    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(getStatus(img)).toBe(null);
  })