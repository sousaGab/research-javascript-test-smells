it('should show message when the folder is empty', async () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');

  // Setup: Ensure a clean, empty directory exists for the test.
  await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
  await fs.promises.mkdir(emptyFolderPath);

  await expect(
    runProgram(['--folder', emptyFolderPath, '--quiet']),
  ).rejects.toThrow(/No SVG files/);

  // Teardown: Clean up the created directory.
  await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
});