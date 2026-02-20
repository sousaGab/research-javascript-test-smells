it("inline example", (done) => {
    runExample("inline", (err) => {
      if (err) return done(err);
      done();
    });
  })