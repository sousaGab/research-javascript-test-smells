test("Resets internal status", () => {
  img.setAttribute("src", url200);
  setSources(img, settings, instance);
  cancelLoading(img, entry, settings, instance);
  
  expect(getStatus(img)).toBeNull();
})