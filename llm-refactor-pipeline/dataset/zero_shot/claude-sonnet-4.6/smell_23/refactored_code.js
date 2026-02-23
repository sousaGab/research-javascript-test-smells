it("Returns the bottom coordinate of the layout", () => {
    const item1 = { i: "1", x: 0, y: 1, w: 1, h: 1 };
    const item2 = { i: "2", x: 1, y: 2, w: 1, h: 1 };
    const layout = [item1, item2];
    const expectedBottom = item2.y + item2.h; // 2 + 1 = 3

    expect(bottom(layout)).toEqual(expectedBottom);
  })