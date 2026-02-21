test("weekdays", () => {
  testNarrowWeekdays();
  testShortWeekdays();
  testLongWeekdays();
  testNumericWeekdays();
  testNullWeekdays();
})

function testNarrowWeekdays() {
  expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
}

function testShortWeekdays() {
  expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
}

function testLongWeekdays() {
  expect(weekdays("long")).toStrictEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);
}

function testNumericWeekdays() {
  expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
}

function testNullWeekdays() {
  expect(weekdays(null)).toStrictEqual(null);
}