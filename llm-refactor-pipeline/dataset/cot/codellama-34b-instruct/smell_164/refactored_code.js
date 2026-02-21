it("static:true in data-grid prevents item from being dragged", () => {
    const onDragStart = jest.fn();

    const { container } = render(
      <ReactGridLayout
        width={1200}
        cols={12}
        rowHeight={30}
        onDragStart={onDragStart}
      >
        <div key="static" data-grid={{ x: 0, y: 0, w: 2, h: 2, static: true }}>
          Static
        </div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item.static");
    expect(item).toBeInTheDocument();

    // Use a helper function to handle the drag and drop behavior
    const dragAndDrop = (item, clientX, clientY) => {
      fireEvent.mouseDown(item, { clientX, clientY });
      fireEvent.mouseMove(document, { clientX: clientX + 100, clientY: clientY + 100 });
      fireEvent.mouseUp(document);
    };

    // Call the helper function with the appropriate arguments
    dragAndDrop(item, 50, 50);

    // onDragStart should NOT have been called for static item
    expect(onDragStart).not.toHaveBeenCalled();
  })