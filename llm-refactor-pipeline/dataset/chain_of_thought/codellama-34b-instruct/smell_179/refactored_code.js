// Your COMPLETE refactored test code here
it("extracts x, y, w, h from data-grid (with compactType=null)", () => {
    const onLayoutChange = jest.fn();

    // Use compactType={null} to test raw data-grid extraction without compaction
    render(
      <ReactGridLayout
        width={1200}
        cols={12}
        compactType={null}
        onLayoutChange={onLayoutChange}
      >
        <div key="test" data-grid={{ x: 3, y: 5, w: 4, h: 2 }}>
          Test
        </div>
      </ReactGridLayout>
    );

    const [layout] = onLayoutChange.mock.calls[0];
    const item = layout.find(l => l.i === "test");
    if (!item) throw new Error("Item not found");

    expect(item.x).toBe(3);
    expect(item.y).toBe(5);
    expect(item.w).toBe(4);
    expect(item.h).toBe(2);
  })