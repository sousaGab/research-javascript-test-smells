test.each([
  {
    description: "full month name (MMMM)",
    dateStr: "May 25 1982",
    formatStr: "MMMM dd yyyy",
    opts: {},
    expected: { year: 1982, month: 5, day: 25 },
  },
  {
    description: "short month name (MMM)",
    dateStr: "Sep 25 1982",
    formatStr: "MMM dd yyyy",
    opts: {},
    expected: { year: 1982, month: 9, day: 25 },
  },
  {
    description: "numeric month (M)",
    dateStr: "5 25 1982",
    formatStr: "M dd yyyy",
    opts: {},
    expected: { year: 1982, month: 5, day: 25 },
  },
  {
    description: "padded numeric month (MM)",
    dateStr: "05 25 1982",
    formatStr: "MM dd yyyy",
    opts: {},
    expected: { year: 1982, month: 5, day: 25 },
  },
  {
    description: "full month name with French locale",
    dateStr: "mai 25 1982",
    formatStr: "MMMM dd yyyy",
    opts: { locale: "fr" },
    expected: { year: 1982, month: 5, day: 25 },
  },
  {
    description: "short month name with French locale",
    dateStr: "janv. 25 1982",
    formatStr: "MMM dd yyyy",
    opts: { locale: "fr" },
    expected: { year: 1982, month: 1, day: 25 },
  },
])(
  "DateTime.fromFormat() parses $description",
  ({ dateStr, formatStr, opts, expected }) => {
    const i = DateTime.fromFormat(dateStr, formatStr, opts);
    expect({ year: i.year, month: i.month, day: i.day }).toEqual(expected);
  }
);