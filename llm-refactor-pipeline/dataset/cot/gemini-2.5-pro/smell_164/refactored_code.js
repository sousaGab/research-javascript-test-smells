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

  // The assertion above guarantees 'item' is a valid element.
  // If it were null, the test would fail there with a clear message.
  fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
  fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
  fireEvent.mouseUp(document);

  // onDragStart should NOT have been called for static item
  expect(onDragStart).not.toHaveBeenCalled();
});