test("DateTime.fromRFC2822 parses Sun, 12 Apr 2015 05:06:07 GMT", () => {
  const expected = [2015, 4, 12, 5, 6, 7];
  const r = DateTime.fromRFC2822("Sun, 12 Apr 2015 05:06:07 GMT").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses Tue, 01 Nov 2016 01:23:45 +0000", () => {
  const expected = [2016, 11, 1, 1, 23, 45];
  const r = DateTime.fromRFC2822("Tue, 01 Nov 2016 01:23:45 +0000").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses Tue, 01 Nov 16 04:23:45 Z", () => {
  const expected = [2016, 11, 1, 4, 23, 45];
  const r = DateTime.fromRFC2822("Tue, 01 Nov 16 04:23:45 Z").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses 01 Nov 2016 05:23:45 z", () => {
  const expected = [2016, 11, 1, 5, 23, 45];
  const r = DateTime.fromRFC2822("01 Nov 2016 05:23:45 z").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses Mon, 02 Jan 2017 06:00:00 -0800", () => {
  const expected = [2017, 1, 2, 14, 0, 0];
  const r = DateTime.fromRFC2822("Mon, 02 Jan 2017 06:00:00 -0800").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses Mon, 02 Jan 2017 06:00:00 +0800", () => {
  const expected = [2017, 1, 1, 22, 0, 0];
  const r = DateTime.fromRFC2822("Mon, 02 Jan 2017 06:00:00 +0800").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses Mon, 02 Jan 2017 06:00:00 +0330", () => {
  const expected = [2017, 1, 2, 2, 30, 0];
  const r = DateTime.fromRFC2822("Mon, 02 Jan 2017 06:00:00 +0330").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses Mon, 02 Jan 2017 06:00:00 -0330", () => {
  const expected = [2017, 1, 2, 9, 30, 0];
  const r = DateTime.fromRFC2822("Mon, 02 Jan 2017 06:00:00 -0330").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses Mon, 02 Jan 2017 06:00:00 PST", () => {
  const expected = [2017, 1, 2, 14, 0, 0];
  const r = DateTime.fromRFC2822("Mon, 02 Jan 2017 06:00:00 PST").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});

test("DateTime.fromRFC2822 parses Mon, 02 Jan 2017 06:00:00 PDT", () => {
  const expected = [2017, 1, 2, 13, 0, 0];
  const r = DateTime.fromRFC2822("Mon, 02 Jan 2017 06:00:00 PDT").toUTC();
  const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
  expect(expected).toEqual(actual);
});