test("weekdays returns narrow format", () => {
  expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
});

test("weekdays returns short format", () => {
  expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
});

test("weekdays returns long format", () => {
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

test("weekdays returns numeric format", () => {
  expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
});

test("weekdays returns null for null input", () => {
  expect(weekdays(null)).toStrictEqual(null);
});