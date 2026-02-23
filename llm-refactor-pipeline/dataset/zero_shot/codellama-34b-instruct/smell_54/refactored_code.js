// Your COMPLETE refactored test code here
test("Resets internal status", () => {
    const img = document.createElement("img");
    const settings = {
        src: url200,
        alt: "Image",
        width: 100,
        height: 100,
    };
    const instance = {
        src: url200,
        alt: "Image",
        width: 100,
        height: 100,
    };
    const entry = {
        src: url200,
        alt: "Image",
        width: 100,
        height: 100,
    };
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(getStatus(img)).toBe(null);
  })