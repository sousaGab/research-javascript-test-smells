test('process, then remove file object', async () => {
  const removed = new Promise((resolve, reject) => {
    pond.onremovefile = (error, file) => {
      if (error) return reject(error);
      resolve(file);
    };
  });

  pond.onaddfile = () => {
    pond.processFile().then(() => pond.removeFile());
  };

  pond.files = [DUMMY_FILE];

  await removed;

  expect(pond.getFiles()).toHaveLength(0);
});