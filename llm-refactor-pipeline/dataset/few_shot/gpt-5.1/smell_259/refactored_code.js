it("inline example", (done) => {
  runExample("inline", (err, result) => {
    expect(err).toBeNull();
    expect(result).toBeDefined();
    done();
  });
});