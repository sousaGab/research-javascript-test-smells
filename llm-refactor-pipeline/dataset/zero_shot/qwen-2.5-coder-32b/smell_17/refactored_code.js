test("Decreases loading count", () => {
    const expectedLoadingCount = 0;
    img.setAttribute("src", url200);
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(instance.loadingCount).toBe(expectedLoadingCount);
  })