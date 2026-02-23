// Your COMPLETE refactored test code here

test("Decreases loading count", () => {
    const url = url200;
    const settings = {
        // ...
    };
    const instance = {
        // ...
    };
    const img = {
        // ...
    };
    const entry = {
        // ...
    };

    img.setAttribute("src", url);
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(instance.loadingCount).toBe(0);
});