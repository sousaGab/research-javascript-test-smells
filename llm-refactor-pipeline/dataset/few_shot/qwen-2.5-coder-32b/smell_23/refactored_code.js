it("Returns the bottom coordinate of the layout", () => {
    const ITEM_1 = { i: "1", x: 0, y: 1, w: 1, h: 1 };
    const ITEM_2 = { i: "2", x: 1, y: 2, w: 1, h: 1 };
    const EXPECTED_BOTTOM_COORDINATE = 3;
    
    expect(
      bottom([ITEM_1, ITEM_2])
    ).toEqual(EXPECTED_BOTTOM_COORDINATE);
  })