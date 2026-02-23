it("Returns the bottom coordinate of the layout", () => {
    const layoutItem1 = { i: "1", x: 0, y: 1, w: 1, h: 1 };
    const layoutItem2 = { i: "2", x: 1, y: 2, w: 1, h: 1 };
    const layout = [layoutItem1, layoutItem2];

    const expectedBottom = layoutItem2.y + layoutItem2.h;

    expect(bottom(layout)).toEqual(expectedBottom);
});