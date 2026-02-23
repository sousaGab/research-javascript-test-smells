test.each([
  ["Sun, 12 Apr 2015 05:06:07 GMT", [2015, 4, 12, 5, 6, 7]],
  ["Tue, 01 Nov 2016 01:23:45 +0000", [2016, 11, 1, 1, 23, 45]],
  ["Tue, 01 Nov 16 04:23:45 Z", [2016, 11, 1, 4, 23, 45]],
  ["01 Nov 2016 05:23:45 z", [2016, 11, 1, 5, 23, 45]],
  ["Mon, 02 Jan 2017 06:00:00 -0800", [2017, 1, 2, 6 + 8, 0, 0]],
  ["Mon, 02 Jan 2017 06:00:00 +0800", [2017, 1, 1, 22, 0, 0]],
  ["Mon, 02 Jan 2017 06:00:00 +0330", [2017, 1, 2, 2, 30, 0]],
  ["Mon, 02 Jan 2017 06:00:00 -0330", [2017, 1, 2, 9, 30, 0]],
  ["Mon, 02 Jan 2017 06:00:00 PST", [2017, 1, 2, 6 + 8, 0, 0]],
  ["Mon, 02 Jan 2017 06:00:00 PDT", [2017, 1, 2, 6 + 7, 0, 0]],
])("DateTime.fromRFC2822 parses %s", (testString, expected) => {
  const r = DateTime.fromRFC2822(testString).toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});