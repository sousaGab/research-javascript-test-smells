it('should show message when the folder is empty', async () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');
  await createEmptyFolder(emptyFolderPath);
  await expect(
    runProgram(['--folder', emptyFolderPath, '--quiet']),
  ).rejects.toThrow(/No SVG files/);
})

async function createEmptyFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    await fs.promises.mkdir(folderPath);
  }
}