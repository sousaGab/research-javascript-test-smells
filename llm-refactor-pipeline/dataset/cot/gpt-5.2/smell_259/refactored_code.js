it("inline example", (done) => {
  runExample("inline", (err) => {
    expect(err).toBeFalsy();
    done(err);
  });
});