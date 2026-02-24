it("inline example", (done) => {
  runExample("inline", (err, result) => {
    expect(err).toBeNull();
    expect(result).toBeDefined();
    expect(result.mode || result.type || result.name).toBe("inline");
    done();
  });
});