it("inline example", (done) => {
  runExample("inline", (err, result) => {
    try {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      done();
    } catch (assertionError) {
      done(assertionError);
    }
  });
});