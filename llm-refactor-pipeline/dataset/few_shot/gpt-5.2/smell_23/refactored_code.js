it("Returns the bottom coordinate of the layout", () => {
  const FIRST_ITEM_X = 0;
  const FIRST_ITEM_Y = 1;
  const FIRST_ITEM_WIDTH = 1;
  const FIRST_ITEM_HEIGHT = 1;

  const SECOND_ITEM_X = 1;
  const SECOND_ITEM_Y = 2;
  const SECOND_ITEM_WIDTH = 1;
  const SECOND_ITEM_HEIGHT = 1;

  const EXPECTED_BOTTOM_COORDINATE = SECOND_ITEM_Y + SECOND_ITEM_HEIGHT;

  const layout = [
    {
      i: "1",
      x: FIRST_ITEM_X,
      y: FIRST_ITEM_Y,
      w: FIRST_ITEM_WIDTH,
      h: FIRST_ITEM_HEIGHT
    },
    {
      i: "2",
      x: SECOND_ITEM_X,
      y: SECOND_ITEM_Y,
      w: SECOND_ITEM_WIDTH,
      h: SECOND_ITEM_HEIGHT
    }
  ];

  expect(bottom(layout)).toEqual(EXPECTED_BOTTOM_COORDINATE);
});