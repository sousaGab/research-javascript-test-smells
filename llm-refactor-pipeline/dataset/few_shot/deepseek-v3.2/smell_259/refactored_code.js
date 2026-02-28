it("inline example", (done) => {
    runExample("inline", (result) => {
        expect(result).toBeDefined();
        done();
    });
});