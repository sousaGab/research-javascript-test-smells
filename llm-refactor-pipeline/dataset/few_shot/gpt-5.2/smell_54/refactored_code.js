test("Resets internal status", () => {
  img.setAttribute("src", url200);

  setSources(img, settings, instance);
  cancelLoading(img, entry, settings, instance);

  const status = getStatus(img);
  expect(status).toBeNull();
});