test("Resets internal status", () => {
    img.setAttribute("src", url200);
    setSources(img, settings, instance);
    expect(getStatus(img)).not.toBe(null);

    cancelLoading(img, entry, settings, instance);

    expect(getStatus(img)).toBe(null);
});