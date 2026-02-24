it("measureBeforeMount re-observes element after switching from placeholder to composed component", async function () {
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth"
  );

  try {
    // Arrange
    global.__resizeObservers__ = [];
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get: () => 800
    });

    // Act
    const { container } = render(<BasicLayout measureBeforeMount={true} />);

    // Assert: The final component is rendered and observed by the ResizeObserver
    const gridLayout = container.querySelector(".react-grid-layout");
    expect(gridLayout).toBeInTheDocument();

    const activeObservers = global.__resizeObservers__.filter(
      obs => obs.observedElements.length > 0
    );
    expect(activeObservers.length).toBeGreaterThan(0);

    const observedElement = activeObservers[0].observedElements[0];
    expect(document.body.contains(observedElement)).toBe(true);

    // Act: Trigger a resize to ensure the observer is functional
    act(() => {
      global.triggerResize(1000);
    });

    // Assert: The component remains stable after the resize
    expect(
      container.querySelector(".react-grid-layout")
    ).toBeInTheDocument();
  } finally {
    // Cleanup
    if (originalOffsetWidth) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetWidth",
        originalOffsetWidth
      );
    }
  }
});