it("inline example", (done) => {
    runExample("inline", done);
    expect(runExample).toHaveBeenCalledWith("inline");
  })