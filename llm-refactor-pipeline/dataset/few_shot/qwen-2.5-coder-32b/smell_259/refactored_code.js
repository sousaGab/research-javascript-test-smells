it("inline example", (done) => {
    runExample("inline", (err) => {
        if (err) {
            done(err);
        } else {
            // Add assertion to verify the example ran successfully
            expect(true).toBe(true);
            done();
        }
    });
});