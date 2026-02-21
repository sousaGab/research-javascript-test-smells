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
    fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
    // Move significantly right and down
    fireEvent.mouseMove(document, { clientX: 400, clientY: 200 });

    expect(onDrag).toHaveBeenCalledWith(
      expect.objectContaining({
        i: "a",
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );

    const [, oldItem, newItem] = onDrag.mock.calls[0];
    expect(newItem.i).toBe("a");
    expect(newItem.x !== oldItem.x || newItem.y !== oldItem.y).toBe(true);
  })