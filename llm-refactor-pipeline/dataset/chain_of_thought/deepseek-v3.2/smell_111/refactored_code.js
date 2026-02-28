describe("weekdays function", () => {
  test("returns correct narrow format", () => {
    expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  test("returns correct short format", () => {
    expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  test("returns correct long format", () => {
    expect(weekdays("long")).toStrictEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
  });

  test("returns correct numeric format", () => {
    expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  test("returns null when input is null", () => {
    expect(weekdays(null)).toStrictEqual(null);
  });
});