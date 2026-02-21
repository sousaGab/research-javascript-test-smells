it('should show message when the folder is empty', async () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');
  await createEmptyFolderIfNotExists(emptyFolderPath);
  await expect(
    runProgram(['--folder', emptyFolderPath, '--quiet']),
  ).rejects.toThrow(/No SVG files/);
})

async function createEmptyFolderIfNotExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    await fs.promises.mkdir(folderPath);
  }
}