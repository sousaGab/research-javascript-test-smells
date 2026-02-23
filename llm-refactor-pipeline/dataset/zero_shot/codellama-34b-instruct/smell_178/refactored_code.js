it("when setting bad key", () => {
  expect(() => {
    const res = deepFreeze(
      { one: "a", two: { b: "c" } },
      { set: true, get: false }
    );
    // $FlowIgnore to test the error throw
    res.badProp = "dog";
  }).toThrowError(
    'Can not set unknown prop "badProp" on frozen object.'
  );
})