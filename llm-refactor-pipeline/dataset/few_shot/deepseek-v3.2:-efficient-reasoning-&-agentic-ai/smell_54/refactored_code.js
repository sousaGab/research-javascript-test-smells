test("Resets internal status", () => {
  img.setAttribute("src", url200);
  setSources(img, settings, instance);
  cancelLoading(img, entry, settings, instance);
  
  const actualStatus = getStatus(img);
  const expectedStatus = null;
  
  expect(actualStatus).toBe(expectedStatus);
})