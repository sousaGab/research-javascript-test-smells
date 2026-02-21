test("weekdays", () => {
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
  const shortWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const longWeekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const numericWeekdays = ["1", "2", "3", "4", "5", "6", "7"];

  expect(weekdays("narrow")).toStrictEqual(weekdays);
  expect(weekdays("short")).toStrictEqual(shortWeekdays);
  expect(weekdays("long")).toStrictEqual(longWeekdays);
  expect(weekdays("numeric")).toStrictEqual(numericWeekdays);
  expect(weekdays(null)).toStrictEqual(null);
})