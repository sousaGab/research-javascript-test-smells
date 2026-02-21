test("Decreases loading count", () => {
    const EXPECTED_LOADING_COUNT = 0;
    
    img.setAttribute("src", url200);
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(instance.loadingCount).toBe(EXPECTED_LOADING_COUNT);
});