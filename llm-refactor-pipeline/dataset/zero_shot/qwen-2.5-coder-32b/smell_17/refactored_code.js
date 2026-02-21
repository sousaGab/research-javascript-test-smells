test("Decreases loading count", () => {
    const initialLoadingCount = 1;
    const expectedLoadingCount = 0;
    
    img.setAttribute("src", url200);
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(instance.loadingCount).toBe(expectedLoadingCount);
  })