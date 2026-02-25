test("Decreases loading count", () => {
    img.setAttribute("src", url200);
    setSources(img, settings, instance);
    const loadingCountBeforeCancel = instance.loadingCount;

    cancelLoading(img, entry, settings, instance);

    expect(instance.loadingCount).toBe(loadingCountBeforeCancel - 1);
})