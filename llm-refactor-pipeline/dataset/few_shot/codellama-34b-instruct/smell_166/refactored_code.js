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
    if (item) {
      fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
      // Move significantly right and down
      fireEvent.mouseMove(document, { clientX: 400, clientY: 200 });
    }

    // Extract the newItem from the onDrag mock call
    const newItem = onDrag.mock.calls[0][2];

    // Assert that the newItem has the expected properties
    expect(newItem.i).toBe("a");
    expect(newItem.x !== oldItem.x || newItem.y !== oldItem.y).toBe(true);
  })