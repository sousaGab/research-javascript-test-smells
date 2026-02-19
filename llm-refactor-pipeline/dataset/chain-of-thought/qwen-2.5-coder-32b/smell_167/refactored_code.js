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

  // Verify layout change was called
  expect(onLayoutChange).toHaveBeenCalled();

  // Get the last call's arguments
  const layout = onLayoutChange.mock.calls[
    onLayoutChange.mock.calls.length - 1
  ][0];

  // Find item 0 and verify its width is at most 1 due to collision
  const item0 = layout.find(item => item.i === "0");
  expect(item0).toBeDefined();
  expect(item0.w).toBeLessThanOrEqual(1);
});