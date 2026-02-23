describe("formatRelativeTime", () => {
  describe("days", () => {
    describe("-1", () => {
      test("auto", () => {
        expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
      });

      test("always", () => {
        expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
      });
    });
  });
});