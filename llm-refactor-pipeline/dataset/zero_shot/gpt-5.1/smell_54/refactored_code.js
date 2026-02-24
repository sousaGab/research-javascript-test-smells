test("Resets internal status to null after canceling loading", () => {
  // Arrange
  img.setAttribute("src", url200);

  // Act
  setSources(img, settings, instance);
  cancelLoading(img, entry, settings, instance);

  // Assert
  const status = getStatus(img);
  expect(status).toBeNull();
});