it("when setting bad key", () => {
  const res = deepFreeze(
    { one: "a", two: { b: "c" } },
    { set: true, get: false }
  );
  expect(() => {
    // $FlowIgnore to test the error throw
    res.badProp = "dog";
  }).toThrow('Can not set unknown prop "badProp" on frozen object.');
});