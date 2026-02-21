test("Resets internal status", () => {
    const img = new Image();
    img.setAttribute("src", url200);
    setSources(img, settings, instance);
    cancelLoading(img, entry, settings, instance);
    expect(getStatus(img)).toBe(null);
  })