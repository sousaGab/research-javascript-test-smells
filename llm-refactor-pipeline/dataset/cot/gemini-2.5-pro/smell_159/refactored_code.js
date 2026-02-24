describe('when the folder is empty', () => {
  const emptyFolderPath = path.resolve(__dirname, 'testSvgEmpty');

  beforeEach(async () => {
    // Setup: Ensure the test directory is created and empty before each test.
    await fs.promises.mkdir(emptyFolderPath, { recursive: true });
  });

  afterEach(async () => {
    // Teardown: Clean up the test directory after each test.
    await fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
  });

  it('should show a message', async () => {
    await expect(
      runProgram(['--folder', emptyFolderPath, '--quiet']),
    ).rejects.toThrow(/No SVG files/);
  });
});