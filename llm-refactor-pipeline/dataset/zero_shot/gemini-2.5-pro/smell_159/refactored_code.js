it('should show message when the folder is empty', async () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');

  // Setup: Unconditionally create a clean, empty directory for the test.
  await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
  await fs.promises.mkdir(emptyFolderPath);

  try {
    // Act & Assert
    await expect(
      runProgram(['--folder', emptyFolderPath, '--quiet']),
    ).rejects.toThrow(/No SVG files/);
  } finally {
    // Teardown: Clean up the created directory to ensure test isolation.
    await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
  }
});