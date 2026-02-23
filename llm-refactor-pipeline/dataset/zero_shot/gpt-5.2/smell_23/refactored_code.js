it("Returns the bottom coordinate of the layout", () => {
  const FIRST_ITEM_Y = 1;
  const SECOND_ITEM_Y = 2;
  const ITEM_HEIGHT = 1;
  const EXPECTED_BOTTOM = SECOND_ITEM_Y + ITEM_HEIGHT;

  expect(
    bottom([
      { i: "1", x: 0, y: FIRST_ITEM_Y, w: 1, h: ITEM_HEIGHT },
      { i: "2", x: 1, y: SECOND_ITEM_Y, w: 1, h: ITEM_HEIGHT }
    ])
  ).toEqual(EXPECTED_BOTTOM);
});