test("Resets internal status", () => {
  // Arrange
  img.setAttribute("src", url200);
  setSources(img, settings, instance);
  
  // Act
  cancelLoading(img, entry, settings, instance);
  
  // Assert
  expect(getStatus(img)).toBe(null);
});