// Your COMPLETE refactored test code here

it("Returns the bottom coordinate of the layout", () => {
    const LAYOUT = [
        { i: "1", x: 0, y: 1, w: 1, h: 1 },
        { i: "2", x: 1, y: 2, w: 1, h: 1 }
    ];
    const EXPECTED_BOTTOM = 3;

    expect(bottom(LAYOUT)).toEqual(EXPECTED_BOTTOM);
});