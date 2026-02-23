const LAYOUT_ITEMS = [
  { i: "1", x: 0, y: 1, w: 1, h: 1 },
  { i: "2", x: 1, y: 2, w: 1, h: 1 }
];
const EXPECTED_BOTTOM_COORDINATE = 3;

it("Returns the bottom coordinate of the layout", () => {
  expect(
    bottom(LAYOUT_ITEMS)
  ).toEqual(EXPECTED_BOTTOM_COORDINATE);
});