it("measureBeforeMount re-observes element after switching from placeholder to composed component", async function () {
  // Clear any existing observers
  global.__resizeObservers__ = [];

  // Mock offsetWidth to return 800px
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth"
  );
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: function () {
      return 800;
    }
  });

  const { container } = render(<BasicLayout measureBeforeMount={true} />);

  // Verify the grid is rendered
  const gridLayout = container.querySelector(".react-grid-layout");
  expect(gridLayout).toBeInTheDocument();

  // Verify the observer is watching the actual element
  const activeObservers = global.__resizeObservers__.filter(
    obs => obs.observedElements.length > 0
  );
  expect(activeObservers.length).toBeGreaterThan(0);

  const observer = activeObservers[0];
  const observedElement = observer.observedElements[0];
  expect(document.body.contains(observedElement)).toBe(true);

  // Trigger a resize and verify it updates
  act(() => {
    global.triggerResize(1000);
  });

  // Verify the grid is still rendered and functional
  expect(
    container.querySelector(".react-grid-layout")
  ).toBeInTheDocument();

  // Restore original offsetWidth descriptor
  if (originalOffsetWidth) {
    Object.defineProperty(
      HTMLElement.prototype,
      "offsetWidth",
      originalOffsetWidth
    );
  }
});