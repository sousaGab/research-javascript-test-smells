describe('when the folder is empty', () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');

  beforeAll(async () => {
    await fs.promises.mkdir(emptyFolderPath, { recursive: true });
  });

  afterAll(async () => {
    await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
  });

  it('should show an error message', async () => {
    await expect(
      runProgram(['--folder', emptyFolderPath, '--quiet']),
    ).rejects.toThrow(/No SVG files/);
  });
});