it("when setting bad key", () => {
  expect(() => {
    const res = deepFreeze(
      { one: "a", two: { b: "c" } },
      { set: true, get: false }
    );
    res.badProp = "dog";
  }).toThrow('Can not set unknown prop "badProp" on frozen object.');
});