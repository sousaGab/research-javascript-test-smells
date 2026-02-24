it("inline example", (done) => {
  runExample("inline", (error) => {
    expect(error).toBeUndefined();
    done();
  });
});