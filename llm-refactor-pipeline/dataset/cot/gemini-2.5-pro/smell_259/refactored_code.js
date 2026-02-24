it("inline example", (done) => {
    runExample("inline", (err, result) => {
      if (err) {
        return done(err);
      }
      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      done();
    });
  })