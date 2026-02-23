// Your COMPLETE refactored test code here
test("Decreases loading count", () => {
    const img = document.createElement("img");
    const settings = {
        src: url200,
    };
    const instance = {
        loadingCount: 1,
    };
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(instance.loadingCount).toBe(0);
  })