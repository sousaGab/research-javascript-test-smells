it('should show message when the folder is empty', async () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');
  
  // Ensure the test directory exists before running the test
  if (!fs.existsSync(emptyFolderPath)) {
    await fs.promises.mkdir(emptyFolderPath);
  }
  
  await expect(
    runProgram(['--folder', emptyFolderPath, '--quiet']),
  ).rejects.toThrow(/No SVG files/);
});