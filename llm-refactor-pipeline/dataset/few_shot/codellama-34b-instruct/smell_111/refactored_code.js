// Your COMPLETE refactored test code here

test("weekdays", () => {
  const weekdaysNarrow = weekdays("narrow");
  const weekdaysShort = weekdays("short");
  const weekdaysLong = weekdays("long");
  const weekdaysNumeric = weekdays("numeric");
  const weekdaysNull = weekdays(null);

  expect(weekdaysNarrow).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  expect(weekdaysShort).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  expect(weekdaysLong).toStrictEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);
  expect(weekdaysNumeric).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  expect(weekdaysNull).toStrictEqual(null);
})