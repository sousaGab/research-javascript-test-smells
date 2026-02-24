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
    // Assert that the grid item exists before interacting with it.
    expect(item).not.toBeNull();

    // Fire events on the guaranteed-to-exist item.
    // Using a non-null assertion here for type safety if using TypeScript/Flow.
    fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
    // Move significantly right and down
    fireEvent.mouseMove(document, { clientX: 400, clientY: 200 });

    // Assert that the onDrag handler was called.
    expect(onDrag).toHaveBeenCalled();

    const [, oldItem, newItem] = onDrag.mock.calls[0];
    // newItem should reflect the new position (different from old)
    expect(newItem.i).toBe("a");
    // Position should have changed
    expect(newItem.x !== oldItem.x || newItem.y !== oldItem.y).toBe(true);
  })