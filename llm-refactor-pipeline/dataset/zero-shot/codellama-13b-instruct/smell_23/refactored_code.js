it("Returns the bottom coordinate of the layout", () => {
    const layout = [
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 1, y: 2, w: 1, h: 1 }
    ];
    const expectedBottomCoordinate = 3;

    expect(bottom(layout)).toEqual(expectedBottomCoordinate);
});