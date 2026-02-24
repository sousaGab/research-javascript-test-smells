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
  // Assert precondition: the item must exist before we can interact with it.
  // This ensures the test fails clearly if the element isn't rendered.
  expect(item).toBeInTheDocument();

  // Attempt to drag the item. The assertion above guarantees 'item' is not null.
  fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
  fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
  fireEvent.mouseUp(document);

  // onDragStart should NOT have been called for a static item.
  expect(onDragStart).not.toHaveBeenCalled();
});