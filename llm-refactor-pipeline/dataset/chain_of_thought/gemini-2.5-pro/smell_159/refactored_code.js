describe('when the target folder is empty', () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');

  beforeEach(async () => {
    // Ensure a clean state by creating a fresh empty directory before each test
    await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
    await fs.promises.mkdir(emptyFolderPath);
  });

  afterEach(async () => {
    // Clean up the created directory after each test
    await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
  });

  it('should reject with an error message', async () => {
    await expect(
      runProgram(['--folder', emptyFolderPath, '--quiet']),
    ).rejects.toThrow(/No SVG files/);
  });
});