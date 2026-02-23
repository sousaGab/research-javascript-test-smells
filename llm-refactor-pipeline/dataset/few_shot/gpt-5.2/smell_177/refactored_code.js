it("extracts minW, maxW, minH, maxH from data-grid", () => {
  const onLayoutChange = jest.fn();

  render(
    <ReactGridLayout width={1200} cols={12} onLayoutChange={onLayoutChange}>
      <div
        key="test"
        data-grid={{
          x: 0,
          y: 0,
          w: 2,
          h: 2,
          minW: 1,
          maxW: 4,
          minH: 1,
          maxH: 3,
        }}
      >
        Test
      </div>
    </ReactGridLayout>
  );

  const [layout] = onLayoutChange.mock.calls[0];
  const item = layout.find((l) => l.i === "test");

  expect(item).toBeDefined();
  expect(item.minW).toBe(1);
  expect(item.maxW).toBe(4);
  expect(item.minH).toBe(1);
  expect(item.maxH).toBe(3);
});