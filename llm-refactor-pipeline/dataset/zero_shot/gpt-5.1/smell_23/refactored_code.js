it("Returns the bottom coordinate of the layout", () => {
  const firstItem = { i: "1", x: 0, y: 1, w: 1, h: 1 };
  const secondItem = { i: "2", x: 1, y: 2, w: 1, h: 1 };

  const expectedBottomCoordinate = secondItem.y + secondItem.h;

  expect(bottom([firstItem, secondItem])).toEqual(expectedBottomCoordinate);
});