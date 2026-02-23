// Your COMPLETE refactored test code here

test("Decreases loading count", () => {
    const ORIGINAL_LOADING_COUNT = 1;
    const EXPECTED_LOADING_COUNT = 0;

    img.setAttribute("src", url200);
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);

    expect(instance.loadingCount).toBe(EXPECTED_LOADING_COUNT);
  })