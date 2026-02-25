it("inline example", (done) => {
  runExample("inline", (err, stats) => {
    if (err) {
      return done(err);
    }
    expect(stats.hasErrors()).toBe(false);
    done();
  });
});