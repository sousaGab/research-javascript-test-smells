it("when setting bad key", () => {
  const action = () =>
    deepFreeze(
      { one: "a", two: { b: "c" } },
      { set: true, get: false }
    ).badProp = "dog";

  expect(action).toThrow(
    'Can not set unknown prop "badProp" on frozen object.'
  );
});