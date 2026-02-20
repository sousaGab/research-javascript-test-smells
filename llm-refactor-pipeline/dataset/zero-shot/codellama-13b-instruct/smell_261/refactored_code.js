test('onprocessfileabort', done => {
  createPond();
  pond.onprocessfileabort = () => {
    expect(pond.files).toHaveLength(1);
    expect(pond.files[0].status).toBe('aborted');
    done();
  };
  pond.files = [data];

  pond.getFile().abortProcessing();
})