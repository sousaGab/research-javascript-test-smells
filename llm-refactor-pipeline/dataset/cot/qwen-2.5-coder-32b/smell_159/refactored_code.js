it('should show message when the folder is empty', async () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');
  
  // Ensure the folder exists before testing
  if (!fs.existsSync(emptyFolderPath)) {
    await fs.promises.mkdir(emptyFolderPath);
  }
  
  // Verify the folder is empty and test the program behavior
  const files = await fs.promises.readdir(emptyFolderPath);
  expect(files.length).toBe(0);
  
  await expect(
    runProgram(['--folder', emptyFolderPath, '--quiet']),
  ).rejects.toThrow(/No SVG files/);
});