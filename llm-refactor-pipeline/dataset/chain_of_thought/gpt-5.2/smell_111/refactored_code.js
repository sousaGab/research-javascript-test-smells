describe("weekdays", () => {
  test.each([
    ["narrow", ["M", "T", "W", "T", "F", "S", "S"]],
    ["short", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]],
    [
      "long",
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    ],
    ["numeric", ["1", "2", "3", "4", "5", "6", "7"]],
    [null, null],
  ])('returns %p format', (format, expected) => {
    expect(weekdays(format)).toStrictEqual(expected);
  });
});