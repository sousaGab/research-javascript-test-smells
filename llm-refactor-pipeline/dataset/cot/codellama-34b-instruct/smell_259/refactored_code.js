// Your COMPLETE refactored test code here

it("inline example", (done) => {
    runExample("inline", done);
    const updated = await User.findById(user.id);
    expect(updated.name).toBe('John');
  })