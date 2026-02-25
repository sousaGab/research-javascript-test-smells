it("Returns the bottom coordinate of the layout", () => {
    const lowestItem = { i: "2", x: 1, y: 2, w: 1, h: 1 };
    const layout = [
      { i: "1", x: 0, y: 1, w: 1, h: 1 },
      lowestItem
    ];
    const expectedBottom = lowestItem.y + lowestItem.h;

    expect(bottom(layout)).toEqual(expectedBottom);
  })