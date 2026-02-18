it("inline example", (done) => {
    runExample("inline", (err) => {
        if (err) {
            done(err);
        } else {
            done();
        }
    });
});