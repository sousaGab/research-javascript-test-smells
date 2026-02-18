const ITEM_1_Y = 1;
const ITEM_1_H = 1;
const ITEM_2_Y = 2;
const ITEM_2_H = 1;
const EXPECTED_BOTTOM_COORDINATE = 3;

it("Returns the bottom coordinate of the layout", () => {
  expect(
    bottom([
      { i: "1", x: 0, y: ITEM_1_Y, w: 1, h: ITEM_1_H },
      { i: "2", x: 1, y: ITEM_2_Y, w: 1, h: ITEM_2_H }
    ])
  ).toEqual(EXPECTED_BOTTOM_COORDINATE);
})