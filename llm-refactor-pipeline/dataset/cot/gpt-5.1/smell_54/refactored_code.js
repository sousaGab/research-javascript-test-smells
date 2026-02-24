test("Resets internal status to null after canceling loading", () => {
  // Arrange
  img.setAttribute("src", url200);
  setSources(img, settings, instance);

  // Act
  cancelLoading(img, entry, settings, instance);

  // Assert
  const status = getStatus(img);
  expect(status).toBeNull();
});