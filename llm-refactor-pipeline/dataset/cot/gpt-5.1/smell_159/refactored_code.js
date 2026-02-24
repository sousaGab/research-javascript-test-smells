it('should show message when the folder is empty', async () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');

  await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
  await fs.promises.mkdir(emptyFolderPath, { recursive: true });

  await expect(
    runProgram(['--folder', emptyFolderPath, '--quiet']),
  ).rejects.toThrow(/No SVG files/);
})