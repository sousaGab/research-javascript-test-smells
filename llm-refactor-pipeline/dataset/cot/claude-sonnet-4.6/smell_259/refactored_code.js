it("inline example", (done) => {
    let exampleCompleted = false;
    let exampleError = null;

    const wrappedDone = (err) => {
      if (err) {
        exampleError = err;
      } else {
        exampleCompleted = true;
      }
      expect(exampleError).toBeNull();
      expect(exampleCompleted).toBe(true);
      done(err);
    };

    runExample("inline", wrappedDone);
  })