test("Decreases loading count", () => {
    const LOADING_COUNT_DECREASED = 0;
    img.setAttribute("src", url200);
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(instance.loadingCount).toBe(LOADING_COUNT_DECREASED);
  })