it("onDrag provides newItem with updated position during drag", () => {
    const onDrag = jest.fn();
    const layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];

    render(
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

    const item = document.querySelector(".react-grid-item");
    fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
    // Move significantly right and down
    fireEvent.mouseMove(document, { clientX: 400, clientY: 200 });

    expect(onDrag).toHaveBeenCalledTimes(1);
    const [, oldItem, newItem] = onDrag.mock.calls[0];
    // newItem should reflect the new position (different from old)
    expect(newItem.i).toBe("a");
    // Position should have changed
    expect(newItem.x).not.toBe(oldItem.x);
    expect(newItem.y).not.toBe(oldItem.y);
  })