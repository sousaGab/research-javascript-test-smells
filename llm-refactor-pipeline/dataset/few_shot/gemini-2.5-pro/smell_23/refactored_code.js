it("Returns the bottom coordinate of the layout", () => {
    const layoutItemOne = { i: "1", x: 0, y: 1, w: 1, h: 1 };
    const layoutItemTwo = { i: "2", x: 1, y: 2, w: 1, h: 1 };
    const layout = [layoutItemOne, layoutItemTwo];
    const expectedBottomCoordinate = layoutItemTwo.y + layoutItemTwo.h;

    expect(bottom(layout)).toEqual(expectedBottomCoordinate);
  });