it("Does not allow elements to move when resizing with no free space", () => {
  const onLayoutChange = jest.fn();
  const { container } = render(
    <PreventCollisionContainer
      layoutA={{ x: 0, y: 0, w: 1, h: 2 }}
      layoutB={{ x: 1, y: 0, w: 7, h: 2 }}
      onLayoutChange={onLayoutChange}
    />
  );

  onLayoutChange.mockClear();

  const handle = container.querySelector(".react-resizable-handle-e");
  act(() => {
    simulateDrag(handle, 100, 30, 300, 30);
  });

  // Layout should be called but item 0 should not be able to expand
  // because item 1 is blocking it.
  expect(onLayoutChange).toHaveBeenCalled();

  const [lastLayout] = onLayoutChange.mock.lastCall;
  const resizedItem = lastLayout.find(item => item.i === "0");

  expect(resizedItem).toBeDefined();
  // Width should remain 1 because of the collision.
  expect(resizedItem.w).toBe(1);
});