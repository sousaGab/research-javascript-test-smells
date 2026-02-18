it("inline example", (done) => {
    runExample("inline", (err) => {
        expect(err).toBeNull();
        done();
    });
});