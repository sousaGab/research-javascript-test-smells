beforeEach(async () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');
  if (!fs.existsSync(emptyFolderPath)) {
    await fs.promises.mkdir(emptyFolderPath);
  }
})

it('should show message when the folder is empty', async () => {
  await expect(
    runProgram(['--folder', emptyFolderPath, '--quiet']),
  ).rejects.toThrow(/No SVG files/);
})