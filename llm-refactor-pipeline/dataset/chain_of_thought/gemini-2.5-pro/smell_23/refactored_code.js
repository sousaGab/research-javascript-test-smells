it("Returns the bottom coordinate of the layout", () => {
    const layoutWithTwoItems = [
      { i: "1", x: 0, y: 1, w: 1, h: 1 }, // bottom: y + h = 2
      { i: "2", x: 1, y: 2, w: 1, h: 1 }  // bottom: y + h = 3
    ];
    const EXPECTED_BOTTOM_COORDINATE = 3;

    expect(bottom(layoutWithTwoItems)).toEqual(EXPECTED_BOTTOM_COORDINATE);
  });