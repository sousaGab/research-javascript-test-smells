it("isDraggable:false in data-grid prevents dragging that item", () => {
  const onDragStart = jest.fn();

  const { container } = render(
    <ReactGridLayout
      width={1200}
      cols={12}
      rowHeight={30}
      isDraggable={true}
      onDragStart={onDragStart}
    >
      <div
        key="nodrag"
        data-grid={{ x: 0, y: 0, w: 2, h: 2, isDraggable: false }}
      >
        No Drag
      </div>
    </ReactGridLayout>
  );

  const item = container.querySelector(".react-grid-item");
  if (item) {
    fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(document);
  }

  expect(onDragStart).not.toHaveBeenCalled();
});