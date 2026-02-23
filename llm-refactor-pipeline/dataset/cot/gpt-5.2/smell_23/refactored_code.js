// Your COMPLETE refactored test code here
it("Returns the bottom coordinate of the layout", () => {
  const FIRST_ITEM_ID = "1";
  const SECOND_ITEM_ID = "2";

  const FIRST_ITEM_X = 0;
  const FIRST_ITEM_Y = 1;
  const SECOND_ITEM_X = 1;
  const SECOND_ITEM_Y = 2;

  const ITEM_WIDTH = 1;
  const ITEM_HEIGHT = 1;

  const EXPECTED_BOTTOM_COORDINATE = 3;

  const layout = [
    { i: FIRST_ITEM_ID, x: FIRST_ITEM_X, y: FIRST_ITEM_Y, w: ITEM_WIDTH, h: ITEM_HEIGHT },
    { i: SECOND_ITEM_ID, x: SECOND_ITEM_X, y: SECOND_ITEM_Y, w: ITEM_WIDTH, h: ITEM_HEIGHT }
  ];

  expect(bottom(layout)).toEqual(EXPECTED_BOTTOM_COORDINATE);
});