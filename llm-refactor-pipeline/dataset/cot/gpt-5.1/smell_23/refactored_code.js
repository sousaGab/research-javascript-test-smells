it("Returns the bottom coordinate of the layout", () => {
  const FIRST_ITEM = { i: "1", x: 0, y: 1, w: 1, h: 1 };
  const SECOND_ITEM = { i: "2", x: 1, y: 2, w: 1, h: 1 };
  const EXPECTED_BOTTOM_COORDINATE = 3;

  expect(bottom([FIRST_ITEM, SECOND_ITEM])).toEqual(EXPECTED_BOTTOM_COORDINATE);
});