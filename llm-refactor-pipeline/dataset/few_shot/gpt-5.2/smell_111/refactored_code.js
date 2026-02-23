describe("weekdays", () => {
  test.each([
    { format: "narrow", expected: ["M", "T", "W", "T", "F", "S", "S"] },
    { format: "short", expected: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    {
      format: "long",
      expected: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    { format: "numeric", expected: ["1", "2", "3", "4", "5", "6", "7"] },
    { format: null, expected: null },
  ])("returns correct weekdays for format: $format", ({ format, expected }) => {
    expect(weekdays(format)).toStrictEqual(expected);
  });
});