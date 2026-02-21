it("inline example", (done) => {
    runExample("inline", done);
    expect(example.getResult()).toBe("inline");
  })