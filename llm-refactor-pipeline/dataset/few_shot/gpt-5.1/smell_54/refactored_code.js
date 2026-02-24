test("Resets internal status to null after canceling loading", () => {
  // Arrange
  img.setAttribute("src", url200);

  // Act
  setSources(img, settings, instance);
  cancelLoading(img, entry, settings, instance);
  const statusAfterCancel = getStatus(img);

  // Assert
  expect(statusAfterCancel).toBeNull();
});