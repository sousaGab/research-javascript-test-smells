it("onDrag provides newItem with updated position during drag", () => {
  const onDrag = jest.fn();
  const layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];

  const { container } = render(
    <ReactGridLayout
      layout={layout}
      width={1200}
      cols={12}
      rowHeight={30}
      onDrag={onDrag}
    >
      <div key="a">A</div>
    </ReactGridLayout>
  );

  const item = container.querySelector(".react-grid-item");
  // An explicit assertion makes the test's prerequisite clear.
  expect(item).not.toBeNull();

  fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
  // Move significantly right and down
  fireEvent.mouseMove(document, { clientX: 400, clientY: 200 });

  // Assert that the callback was invoked.
  expect(onDrag).toHaveBeenCalled();

  // Assert on the arguments of the first call.
  const [, oldItem, newItem] = onDrag.mock.calls[0];
  expect(newItem.i).toBe("a");

  // Assert that the position has changed.
  const oldPosition = { x: oldItem.x, y: oldItem.y };
  const newPosition = { x: newItem.x, y: newItem.y };
  expect(newPosition).not.toEqual(oldPosition);
});