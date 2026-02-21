const IMAGE_URL = "https://example.com/image.jpg";
const LOADING_COUNT = 0;

test("Decreases loading count", () => {
    img.setAttribute("src", IMAGE_URL);
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(instance.loadingCount).toBe(LOADING_COUNT);
  })