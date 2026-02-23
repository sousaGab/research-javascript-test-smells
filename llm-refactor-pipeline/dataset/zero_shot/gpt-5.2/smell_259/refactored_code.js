it("inline example", async () => {
  await new Promise((resolve, reject) => {
    runExample("inline", (err) => (err ? reject(err) : resolve()));
  });
  expect.assertions(0);
});