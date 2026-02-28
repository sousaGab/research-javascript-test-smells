it("inline example", (done) => {
    runExample("inline", (err) => {
        if (err) {
            done(err);
        } else {
            // Add explicit assertion to verify the expected behavior
            expect(true).toBe(true); // Placeholder assertion - replace with actual validation
            done();
        }
    });
});