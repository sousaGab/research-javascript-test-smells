it("Does not allow elements to move when resizing with no free space", () => {
  const onLayoutChange = jest.fn();
  const { container } = render(
    <PreventCollisionContainer
      layoutA={{ x: 0, y: 0, w: 1, h: 2 }}
      layoutB={{ x: 1, y: 0, w: 7, h: 2 }}
      onLayoutChange={onLayoutChange}
    />
  );

  // Get initial layout
  onLayoutChange.mockClear();

  const handle = container.querySelector(".react-resizable-handle-e");
  act(() => {
    simulateDrag(handle, 100, 30, 300, 30);
  });

  // Verify layout
  expect(verifyLayout(onLayoutChange)).toBe(true);
});

function verifyLayout(onLayoutChange) {
  if (onLayoutChange.mock.calls.length > 0) {
    const layout =
      onLayoutChange.mock.calls[
        onLayoutChange.mock.calls.length - 1
      ][0];
    const item0 = layout.find(item => item.i === "0");
    // Width should be at most 1 because of collision
    if (item0) {
      return item0.w <= 1;
    }
  }
  return false;
}