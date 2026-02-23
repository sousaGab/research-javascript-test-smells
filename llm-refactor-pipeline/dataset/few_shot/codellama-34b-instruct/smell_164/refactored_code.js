describe("static:true in data-grid prevents item from being dragged", () => {
  let onDragStart;
  let container;
  let item;

  beforeEach(() => {
    onDragStart = jest.fn();

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

    item = container.querySelector(".react-grid-item.static");
  });

  test("onDragStart should NOT have been called for static item", () => {
    expect(item).toBeInTheDocument();

    fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(document);

    expect(onDragStart).not.toHaveBeenCalled();
  });
});